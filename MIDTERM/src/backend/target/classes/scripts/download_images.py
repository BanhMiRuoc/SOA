import os
import requests
from urllib.parse import urlparse
import time
from pathlib import Path

# Dictionary chứa các URL hình ảnh theo category
IMAGE_URLS = {
    "sushi": {
        "Salmon Roll": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        "Spicy Tuna Roll": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        "Dragon Roll": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        "Rainbow Roll": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c"
    },
    "sashimi": {
        "Salmon Sashimi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        "Tuna Sashimi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
        "Mixed Sashimi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c"
    },
    "noodles": {
        "Tonkotsu Ramen": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Spicy Miso Ramen": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Shoyu Ramen": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Seafood Ramen": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Kitsune Udon": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Beef Udon": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Tempura Udon Set": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Curry Udon": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    },
    "fried": {
        "Tôm Tempura": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Rau Củ Tempura": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Tempura Thập Cẩm": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    },
    "grilled": {
        "Wagyu Yakiniku": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Pork Belly BBQ": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Mixed BBQ Set": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Spicy BBQ Chicken": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    },
    "rice": {
        "Cơm Bò Teriyaki": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Cơm Gà Karaage": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Cơm Cá Hồi Nướng": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Cơm Katsu": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Cơm Trứng Lươn": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    },
    "salad": {
        "Salad Cá Hồi": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Bò": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Đậu Phụ": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Hải Sản": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Wakame": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Tataki": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Goma": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    },
    "sides": {
        "Kim Chi": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Canh Miso": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Salad Rong Biển": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Đậu Phụ Lạnh": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Canh Rong Biển": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    },
    "drinks": {
        "Coca Cola": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Sprite": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Trà Ô Long": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Nước Cam": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Matcha Đá": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Ramune Soda": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Yuzu Juice": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Matcha Latte": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Sake Junmai": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Shochu": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Rượu Mơ": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Bia Asahi": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Bia Sapporo": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
        "Bia Kirin": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"
    }
}

def download_image(url, save_dir):
    try:
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(save_dir, exist_ok=True)
        
        # Lấy tên file từ URL
        filename = os.path.basename(urlparse(url).path)
        if not filename:
            filename = 'image.jpg'
            
        # Đường dẫn đầy đủ để lưu file
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
        print(f"Lỗi khi tải {url}: {str(e)}")
        return False

def main():
    # Thư mục gốc để lưu hình ảnh
    base_dir = Path("frontend/public/images")
    
    # Tải hình ảnh cho từng category
    for category, items in IMAGE_URLS.items():
        category_dir = base_dir / category
        print(f"\nĐang tải hình ảnh cho category: {category}")
        
        for item_name, url in items.items():
            print(f"Đang tải: {item_name}")
            download_image(url, category_dir)
            time.sleep(1)  # Delay 1 giây giữa các lần tải

if __name__ == "__main__":
    main() 