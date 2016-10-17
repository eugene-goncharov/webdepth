#!/usr/bin/env python

import cv2
import numpy as np
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

def removeFiles(file):
	try:
		f = open(file, 'r')
		data = json.load(f)
		fileName = os.path.basename(os.path.splitext(file)[0])
		f.close()
	except:
		print file


if __name__ == '__main__':
	p = Pool(4)

	p.map(removeFiles, files)
