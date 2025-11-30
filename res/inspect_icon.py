from PIL import Image
import sys

try:
    img = Image.open("icon.png")
    print(f"Format: {img.format}")
    print(f"Size: {img.size}")
    print(f"Mode: {img.mode}")
    
    width, height = img.size
    
    # Sample points
    points = [
        (0, 0),
        (width//2, 0),
        (width-1, 0),
        (0, height//2),
        (width//2, height//2),
        (width-1, height//2),
        (0, height-1),
        (width//2, height-1),
        (width-1, height-1)
    ]
    
    print("\nSample Pixels (R, G, B, A):")
    for p in points:
        try:
            color = img.getpixel(p)
            print(f"{p}: {color}")
        except Exception as e:
            print(f"{p}: Error {e}")

    # Check for yellow-ish pixels
    print("\nChecking for yellow pixels (R>200, G>200, B<100)...")
    yellow_count = 0
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y] if len(pixels[x, y]) == 4 else (*pixels[x, y], 255)
            if r > 200 and g > 200 and b < 100 and a > 0:
                yellow_count += 1
                if yellow_count < 5:
                    print(f"Yellow found at {x},{y}: {pixels[x,y]}")
    
    print(f"Total yellow pixels found: {yellow_count}")

except Exception as e:
    print(f"Error: {e}")
