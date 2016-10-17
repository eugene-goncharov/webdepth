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


path = './data/_json/*.json'   
files = glob.glob(path)   

def removeFiles(file):
	try:
		f = open(file, 'r')
		# data = json.load(f)
		fileName = os.path.basename(os.path.splitext(file)[0])
		f.close()

		if not os.path.isfile("./data/" + fileName + ".png"):
			os.remove(file)
			return;
	except:
	    print f
	    os.remove(file)



if __name__ == '__main__':
	p = Pool(4)

	print(p.map(removeFiles, files))
