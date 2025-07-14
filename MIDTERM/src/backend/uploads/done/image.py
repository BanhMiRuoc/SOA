from rembg import remove
from PIL import Image
import os
import logging
from pathlib import Path
import io
import sys

# Cấu hình logging với stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def setup_folders(input_folder: str, output_folder: str) -> tuple:
    """Tạo và kiểm tra thư mục input/output."""
    try:
        input_path = Path(input_folder).absolute()
        output_path = Path(output_folder).absolute()
        
        logging.info(f"Đang kiểm tra thư mục input: {input_path}")
        logging.info(f"Đang kiểm tra thư mục output: {output_path}")
        
        # Tạo thư mục nếu chưa tồn tại
        output_path.mkdir(parents=True, exist_ok=True)
        
        if not input_path.exists():
            raise FileNotFoundError(f"Thư mục input không tồn tại: {input_folder}")
        
        return input_path, output_path
    except Exception as e:
        logging.error(f"Lỗi khi thiết lập thư mục: {str(e)}")
        raise

def process_image(input_path: Path, output_path: Path) -> None:
    """Xử lý một ảnh đơn lẻ - xóa background."""
    try:
        logging.info(f"Đang xử lý ảnh: {input_path.name}")
        
        # Đọc và xử lý ảnh
        input_img = Image.open(input_path)
        logging.info(f"Đã đọc ảnh input: {input_path.name}, mode={input_img.mode}, size={input_img.size}")
        
        # Chuyển đổi ảnh thành bytes
        img_byte_arr = io.BytesIO()
        input_img.save(img_byte_arr, format=input_img.format)
        img_byte_arr = img_byte_arr.getvalue()
        logging.info("Đã chuyển đổi ảnh thành bytes")
        
        # Xóa background
        logging.info("Đang xóa background...")
        output_image = remove(img_byte_arr)
        logging.info("Đã xóa background thành công")
        
        # Xử lý ảnh kết quả
        with Image.open(io.BytesIO(output_image)) as img:
            logging.info(f"Đang xử lý ảnh kết quả: mode={img.mode}, size={img.size}")
            
            # Tạo background đen
            black_bg = Image.new("RGB", img.size, (0, 0, 0))
            
            # Kiểm tra xem ảnh có alpha channel không
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                black_bg.paste(img, mask=img.convert('RGBA').split()[3])
                logging.info("Đã áp dụng alpha channel")
            else:
                black_bg.paste(img)
                logging.info("Đã paste ảnh không có alpha channel")
            
            # Lưu ảnh đã xử lý
            black_bg.save(output_path, quality=95)
            logging.info(f"Đã lưu ảnh đã xử lý tại: {output_path}")
            
        logging.info(f"Đã xử lý thành công: {input_path.name}")
        
    except Exception as e:
        logging.error(f"Lỗi khi xử lý {input_path.name}: {str(e)}")
        raise

def main():
    print("Bắt đầu chương trình...")
    # Cấu hình thư mục
    INPUT_FOLDER = "backup"
    OUTPUT_FOLDER = "done"
    SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg', '.webp'}
    
    try:
        logging.info("Bắt đầu chương trình xử lý ảnh...")
        input_path, output_path = setup_folders(INPUT_FOLDER, OUTPUT_FOLDER)
        
        # Đếm số file đã xử lý
        files = [f for f in input_path.iterdir() if f.suffix.lower() in SUPPORTED_FORMATS]
        total_files = len(files)
        logging.info(f"Tìm thấy {total_files} file ảnh cần xử lý")
        
        processed_count = 0
        
        # Xử lý từng file trong thư mục input
        for file in files:
            output_file = output_path / file.name
            try:
                process_image(file, output_file)
                processed_count += 1
                logging.info(f"Tiến độ: {processed_count}/{total_files}")
            except Exception as e:
                logging.error(f"Không thể xử lý {file.name}: {str(e)}")
                continue
        
        logging.info(f"Hoàn thành! Đã xử lý {processed_count}/{total_files} ảnh")
        
    except Exception as e:
        logging.error(f"Lỗi: {str(e)}")
        raise

if __name__ == "__main__":
    main()
