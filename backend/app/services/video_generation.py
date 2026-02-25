import os
import uuid
import asyncio
import time
from google import genai
from google.genai import types
from google.cloud import storage
from app.core.config import settings

class VideoService:
    def __init__(self):
        """ VideoService를 초기화합니다. """
        self.api_key = os.getenv('GEMINI_API_KEY', 'AIzaSyB7eo0Mb3sz6f1ROaF7ekZeQryyZ3vgNys')
        self.client = genai.Client(api_key=self.api_key, http_options={'api_version': 'v1alpha'})
        self.gemini_model_id = 'gemini-2.0-flash'
        self.veo_model_id = 'veo-3.1-generate-preview'

        self.storage_client = storage.Client(project='wala-media-studio-7890')
        self.gcs_bucket = self.storage_client.bucket('wala-media-assets-7890')

    async def generate_refined_prompt(self, user_template_text: str) -> str:
        """ 상세 프롬프트를 생성합니다. """
        prompt = (
            f"You are a professional video director. Based on the following concept, "
            f"write a detailed, single-paragraph video generation prompt for a generative AI model like Google Veo: '{user_template_text}'. "
            f"Technical specifications: 8K resolution, cinematic lighting, photorealistic."
        )
        def call_gemini():
            return self.client.models.generate_content(model=self.gemini_model_id, contents=prompt)
        response = await asyncio.to_thread(call_gemini)
        return response.text

    async def generate_music_prompt(self, video_prompt: str) -> str:
        """ 영상 프롬프트를 바탕으로 어울리는 음악 프롬프트를 생성합니다. """
        prompt = (
            f"You are a professional music producer and sound designer. "
            f"Based on the following video description, create a detailed text-to-music generation prompt: '{video_prompt}'. "
            f"Focus on mood, instruments, rhythm, and tempo. Keep it within 100 words."
        )
        def call_gemini():
            return self.client.models.generate_content(model=self.gemini_model_id, contents=prompt)
        response = await asyncio.to_thread(call_gemini)
        return response.text

    async def generate_video_from_image(self, asset_gcs_uri: str, prompt: str) -> (str, str):
        """ 비동기 방식으로 비디오를 생성합니다. 🥒 """
        print(f"REAL VEO 비디오 생성 시작...")

        try:
            # 1. 생성 요청
            def call_veo():
                return self.client.models.generate_videos(
                    model=self.veo_model_id, 
                    prompt=prompt
                )
            
            op = await asyncio.to_thread(call_veo)
            
            # 작업 이름 추출 (로깅용)
            op_name = getattr(op, 'name', str(op))
            print(f"작업 시작됨: {op_name}")
            
            # 2. 폴링 루프
            current_op = op
            start_time = time.time()
            max_wait = 600 # 10분
            
            while time.time() - start_time < max_wait:
                # 상태 확인
                is_done = getattr(current_op, 'done', False)
                if isinstance(current_op, str):
                    # 만약 문자열이 리턴된 경우 (비정상 상황 대응)
                    if any(w in current_op.upper() for w in ["SUCCEEDED", "DONE", "COMPLETED"]):
                        is_done = True
                
                if is_done:
                    print("작업 완료!")
                    break
                
                print(f"작업 진행 중... (시간: {int(time.time() - start_time)}초)")
                await asyncio.sleep(20)
                
                # 업데이트 요청
                def poll():
                    # 중요: client.operations.get()은 Operation 객체를 인자로 받아야 합니다.
                    # 만약 current_op가 문자열이라면 에러가 날 수 있으므로 op(원본 객체)를 계속 사용하거나
                    # name= 인자를 사용해야 하는데, SDK 버전에 따라 다를 수 있으므로 안전하게 처리합니다.
                    try:
                        return self.client.operations.get(current_op)
                    except AttributeError as e:
                        if "'str' object has no attribute 'name'" in str(e):
                            # SDK 버그 대응: name이 문자열이면 내부 메서드나 다른 방식 시도
                            # 여기서는 원본 op 객체가 있다면 그것의 name을 사용하거나 
                            # 혹은 SDK가 기대하는 형태의 객체를 전달
                            return self.client.operations.get(op)
                        raise e
                
                current_op = await asyncio.to_thread(poll)
            
            # 3. 결과 추출
            # current_op가 최종 상태를 가지고 있어야 함
            final_result = None
            for attr in ['result', 'response']:
                if hasattr(current_op, attr):
                    val = getattr(current_op, attr)
                    if val and hasattr(val, 'generated_videos'):
                        final_result = val
                        break
            
            if not final_result or not final_result.generated_videos:
                # 마지막으로 한 번 더 가져오기 시도
                current_op = await asyncio.to_thread(lambda: self.client.operations.get(op))
                final_result = getattr(current_op, 'result', getattr(current_op, 'response', None))

            if not final_result or not final_result.generated_videos:
                raise Exception("비디오 생성 결과를 찾을 수 없습니다.")

            video_obj = final_result.generated_videos[0].video
            video_data = video_obj.video_bytes
            
            if not video_data and video_obj.uri:
                import requests
                # requests를 사용하여 URI에서 데이터 가져오기 (API 키 포함)
                def download_video():
                    response = requests.get(video_obj.uri, params={'key': self.api_key})
                    response.raise_for_status()
                    return response.content
                
                video_data = await asyncio.to_thread(download_video)
            
            if not video_data:
                raise Exception("비디오 데이터를 확보할 수 없습니다.")
            
            # 4. GCS 업로드
            video_filename = f"generated_videos/veo_video_{uuid.uuid4()}.mp4"
            blob = self.gcs_bucket.blob(video_filename)
            await asyncio.to_thread(blob.upload_from_string, video_data, content_type="video/mp4")
            blob.make_public()
            
            return f"gs://wala-media-assets-7890/{video_filename}", blob.public_url

        except Exception as e:
            print(f"VEO 프로세스 에러: {e}")
            import traceback
            traceback.print_exc()
            raise e

