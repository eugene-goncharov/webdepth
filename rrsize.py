#!/usr/bin/env python

import numpy as np
import cv2
import scipy.misc as smp
import glob   
import json
import os
import sys
import traceback
from PIL import Image
from pprint import pprint
from multiprocessing import Pool


path = './data/_json/*.json'   
files = glob.glob(path)   

# Function definition is here
def doIterate(obj, im, cb, imageSize, list):
	node = obj["target"]

	cb(obj, im, imageSize, list)

	if "children" in node:
		for child in node["children"]:
			chObj = {}
			chObj["target"] = child
			chObj["depth"] = obj["depth"] + 1

			doIterate(chObj, im, cb, imageSize, list)

def elementIsNotRoot(el):
	return el["tag"] != '#document' and el["tag"] != 'HTML'

def retinify(value):
	return value

def printme(obj, im, imageSize, list):
	el = obj["target"]

	# if "tag" in el:
	# 	print el["tag"]
	# else:
	# 	print el["name"]
	
	if ("anonymous" not in el or el["anonymous"] == False) and elementIsNotRoot(el) and el["width"] and el["height"]:
		absX = retinify(int(obj["target"]["absX"]))
		absY = retinify(int(obj["target"]["absY"]))
		width = retinify(int(obj["target"]["width"]))
		height = retinify(int(obj["target"]["height"]))
		depth = retinify(int(obj["depth"]))

		x = absX + width
		y = absY + height

		# im[absX:x, absY:y] = [depth, 131, 180]
		li = {}
		li['absX']= absX
		li['absY']= absY
		li['width']= width
		li['height']= height
		li['x']= x
		li['y']= y
		li['depth'] = depth

		list.append(li)

	return

def drawPixels(file):
	try:
		f = open(file, 'r')
		data = json.load(f)
		fileName = os.path.basename(os.path.splitext(file)[0])
		f.close()

		image = Image.open("./data/" + fileName + ".png")
		pix = image.load()
		print image.size[0],image.size[1]
		imageSize = image.size

		pixels_out = np.zeros((imageSize[0], imageSize[1], 3), dtype=np.uint8 )
		
		obj = {}
		obj["target"] = data
		obj["depth"] = 0

		myList = []

		doIterate(obj, pixels_out, printme, image.size, myList)
		
		newList = sorted(myList, key=lambda li: li['depth'])

		for lii in newList:
			absX = lii['absX']
			absY = lii['absY']
			x = lii['x'] + 1
			y = lii['y']+ 1
			depth = lii['depth']

			pixels_out[absX:x, absY:y] = [depth, 0, 0]

		
		smp.imsave("./data/meta/"+fileName+'.png', np.rot90(np.fliplr(pixels_out)))
		image = cv2.imread("./data/" + fileName + ".png")
		
		print 'Image shape:',image.shape
		dim = (512, int(image.shape[0] * 0.5))
		print 'Dim',dim
		
		if(dim[1] > 384):
			# perform the actual resizing of the image and show it
			resized = cv2.resize(image, dim, interpolation = cv2.INTER_AREA)
			print resized.shape
			cv2.imwrite("./data/rs/" + fileName + ".png", resized)

			image = cv2.imread("./data/meta/"+fileName+'.png')
		 
			# perform the actual resizing of the image and show it
			resized = cv2.resize(image, dim, interpolation = cv2.INTER_NEAREST)
			print resized.shape
			cv2.imwrite("./data/meta/rs/"+fileName+'.png', resized)
	except Exception,e: 
		print str(e)
		print file


if __name__ == '__main__':
	p = Pool(4)

	print(p.map(drawPixels, files))
