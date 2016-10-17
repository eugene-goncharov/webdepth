#!/usr/bin/env python

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


path = './data/*.png'   
files = glob.glob(path)   

def removeFiles(file):
	f = open(file, 'r')
	# data = json.load(f)
	fileName = os.path.basename(os.path.splitext(file)[0])
	f.close()

	if not os.path.isfile("/Volumes/Egoist-External/browser/painter/data/_json/" + fileName + ".json"):
		print 'File Not Exist', fileName + ".png"
		os.remove(file)
		return;


if __name__ == '__main__':
	p = Pool(4)

	print(p.map(removeFiles, files))
