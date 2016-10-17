#!/usr/bin/env python

import numpy as np
import numpy.ma as ma
import cv2
import scipy.misc as smp
import glob   
import json
import os
import sys
import traceback
import random
from PIL import Image
from pprint import pprint
from multiprocessing import Pool


path = './v2/data/_json/*.json'   
# files = glob.glob(path)

files = ["./v2/data/_json/http:--2goodtheme-com-html-buildup-rtl-blog-detail-html.json"]

def checkFile(file):
	print file
	with open(file, 'r') as f:
		fileName = os.path.basename(os.path.splitext(file)[0])

		image = Image.open("./v2/data/" + fileName + ".png")
		pix = image.load()
		print image.size[0],image.size[1]
		imageSize = image.size

		my_lines = f.readlines()
		lineNumber = 1;
		
		pixels_out = np.zeros((imageSize[0], imageSize[1], 3), dtype=np.uint8 )
		visibleToHitTesting = 0

		for line in my_lines:
			try:
				# line = line.strip()
				lineNumber += 1
				
				if("positive z-order list(" not in line 
					and "negative z-order list(" not in line 
						and "normal flow list(" not in line 
							and "text run" not in line 
							and "SVG" not in line
							and "SourceGraphic" not in line
							and "feBlend" not in line 
							and "feFlood" not in line
							and "feComposite" not in line
							):
					try:
						depth = len(line) - len(line.lstrip(' '))
						target = json.JSONDecoder().decode(line)

						if("paintLayerType" in target):
							visibleToHitTesting =  target["visibleToHitTesting"]

						if ("paintLayerType" not in target 
							and "anonymous" not in target
							and "position" in target):
							absX = int(target["position"]["x"])
							absY = int(target["position"]["y"])
							width = int(target["position"]["size"]["width"])
							height = int(target["position"]["size"]["height"])

							if(visibleToHitTesting == 0):
								continue

							if(absX < 0):
								absX = 0

							if(absY < 0):
								absY = 0

							if(width == 0 or height == 0):
								continue

							x = absX + width
							y = absY + height
							
							dv = depth
							
							if(depth <= 40):
								
								if (depth > 0):
									dv = ((depth - 0)*255)/40;
								
								red = dv;
								green = random.randint(0, 255)
								blue = random.randint(0,255)

								part = pixels_out[absX:x, absY:y]
								# print red, green, blue
								# print part
								# print absX, ':', x, ',', absY, ":", y

								channels = cv2.split(part)
								r = channels[0]
								channels[1].fill(green)
								channels[2].fill(blue)

								masked = ma.masked_where(dv > r, r)

								
								filled = ma.filled(masked, red)
								# pixels_out[absX:x, absY:y] = [red, green,blue]
								
								channels[0] = filled
								merged = cv2.merge(channels)

								pixels_out[absX:x, absY:y] = merged
								
								print line


					except Exception, e:
						print str(e)
						print file, ", ", lineNumber,", line:[ ", line, " ]"
			except Exception,e: 
				print str(e)
				print file
				raise e
		
		smp.imsave("./v2/meta/"+fileName+'.png', np.rot90(np.fliplr(pixels_out)))
		print 'Saved'

if __name__ == '__main__':
	
	for file in files:
		checkFile(file);
	