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


path = './data/rs/*.png'   
files = glob.glob(path)   
file_count = len(files)
count = 0

f = open('./../dnn/data/images/train.txt', 'w+')

while count < int(file_count * 0.8):
	file = files[count]
	fileName = os.path.basename(os.path.splitext(file)[0])
	f.write(fileName + '\n')
	count += 1

f = open('./../dnn/data/images/test.txt', 'w+')
while count < file_count:
	file = files[count]
	fileName = os.path.basename(os.path.splitext(file)[0])
	f.write(fileName + '\n')
	count += 1	

f.close()