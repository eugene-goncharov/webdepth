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
maxDepth = 0

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
		#print image.size[0],image.size[1]
		imageSize = image.size

		pixels_out = np.zeros((imageSize[0], imageSize[1], 3), dtype=np.uint8 )
		
		obj = {}
		obj["target"] = data
		obj["depth"] = 0

		myList = []

		doIterate(obj, pixels_out, printme, image.size, myList)
		
		newList = sorted(myList, key=lambda li: li['depth'])

		for lii in newList:
			print lii['depth']
	except:
		print file

if __name__ == '__main__':
	p = Pool(4)

	p.map(drawPixels, files)

	print maxDepth
