#!/usr/bin/env python

import numpy as np
import scipy.misc as smp
import glob   
import json
import os
import cv2
import sys
import traceback
from PIL import Image
from pprint import pprint
from multiprocessing import Pool


path = '/home/vnc/BackgroundKO/eugene/web/painter/data/meta/rs/*.png'
files = glob.glob(path)

def checkFile(file):
	image = cv2.imread(file)
	return image.reshape((image.shape[0]*image.shape[1], 3)).max(axis=0)[2]


if __name__ == '__main__':
	p = Pool(4)

	maxes = (p.map(checkFile, files))

	print np.amax(maxes)
