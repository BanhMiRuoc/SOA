import os
import requests
from pathlib import Path
import time

# Dictionary chứa URL hình ảnh đồ uống thực tế
DRINK_URLS = {
    "Coca Cola": "https://images.unsplash.com/photo-1554866585-cd94860890b7",
    "Sprite": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3",
    "Trà Ô Long": "https://images.unsplash.com/photo-1576092768241-dec231879fc3",
    "Nước Cam": "https://images.unsplash.com/photo-1613478223719-2ab802602423",
    "Matcha Đá": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7",
    "Ramune Soda": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e",
    "Yuzu Juice": "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b",
    "Matcha Latte": "https://images.unsplash.com/photo-1545518514-ce8448f33a0f",
    # Đồ uống có cồn
    "Sake Junmai": "https://images.unsplash.com/photo-1579010961717-00c716066931",
    "Shochu": "https://images.unsplash.com/photo-1609344093009-1aa77d68c58d",
    "Rượu Mơ": "https://images.unsplash.com/photo-1609344093009-1aa77d68c58d",
    "Bia Asahi": "https://images.unsplash.com/photo-1577030874276-2d52b7f9d3c9",
    "Bia Sapporo": "https://images.unsplash.com/photo-1577030874276-2d52b7f9d3c9",
    "Bia Kirin": "https://images.unsplash.com/photo-1577030874276-2d52b7f9d3c9"
}

def download_image(url, filename, save_dir="backend/uploads/drinks"):
    try:
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(save_dir, exist_ok=True)
        
        # Tạo tên file
        filename = filename.lower().replace(" ", "-") + ".jpg"
        filepath = os.path.join(save_dir, filename)
        
        # Tải hình ảnh
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Lưu file
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    
        print(f"Đã tải thành công: {filename}")
        return True
        
    except Exception as e:
        print(f"Lỗi khi tải {filename}: {str(e)}")
        return False

def main():
    print("Bắt đầu tải hình ảnh đồ uống...")
    
    for drink_name, url in DRINK_URLS.items():
        print(f"\nĐang tải: {drink_name}")
        download_image(url, drink_name)
    
    print("\nHoàn thành tải hình ảnh đồ uống!")

if __name__ == "__main__":
    main() 