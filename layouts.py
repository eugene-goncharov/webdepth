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
from operator import itemgetter, attrgetter

path = './v2/data/_json/*.json'
files = glob.glob(path)

# files = ["./v2/data/_json/http:--achtungthemes-com-borano-portfolio-lightbox-html.json"]

def toPixels(node, pixels_out, image_width, image_height):
    try:
        target = node['value']
        depth = node['depth']

        if ("abr" in target and "tagName" in target) and (target["abr"]["x"] < image_width and target["abr"]["y"] < image_height):
            hasZeroOpacity = "hasZeroOpacityParent" in target and target['hasZeroOpacityParent'] == 1

            if (not hasZeroOpacity):
                width = int(target["abr"]["size"]["width"])
                height = int(target["abr"]["size"]["height"])

                absX = int(target["abr"]["x"])
                absY = int(target["abr"]["y"])

                if absX < 0:
                    absX = 0

                if absY < 0:
                    absY = 0

                if width == 0 or height == 0:
                    return

                x = absX + width
                y = absY + height

                dv = depth

                if (depth > 0):
                    dv = ((depth - 0) * 255) / 30

                red = dv
                green = random.randint(0, 255)
                blue = random.randint(0, 255)

                part = pixels_out[absX:x, absY:y]
                print red, green, blue
                print absX, ':', x, ',', absY, ":", y

                channels = cv2.split(part)
                r = channels[0]
                channels[1].fill(green)
                channels[2].fill(blue)

                masked = ma.masked_where(red > r, r)

                filled = ma.filled(masked, red)
                # pixels_out[absX:x, absY:y] = [red, green,blue]

                channels[0] = filled
                merged = cv2.merge(channels)

                pixels_out[absX:x, absY:y] = merged

        if node['children']:
            for child in node['children']:
                if ("paintLayerType" in child['value'] and child['value']['paintLayerType'] == "layer"):
                    layer = child['value']

                    if("backgroundClip" in layer):
                        clip = layer["clip"]
                        if(clip["x"] == 0 and clip["y"] == 0 and clip["size"]["width"] == 0 and clip["size"]["height"] == 0):
                            # do not process child of layers with zero clip
                            continue
                    toPixels(child, pixels_out, image_width, image_height)
                elif ("paintLayerType" not in child['value']):
                    toPixels(child,pixels_out, image_width, image_height)
    except Exception, e:
        raise e


def checkFile(file):
    print file
    with open(file, 'r') as f:
        file_name = os.path.basename(os.path.splitext(file)[0])

        image = Image.open("./v2/data/" + file_name + ".png")
        pix = image.load()
        print image.size[0], image.size[1]
        image_size = image.size

        my_lines = f.readlines()
        line_number = 0

        pixels_out = np.zeros((image_size[0], image_size[1], 3), dtype=np.uint8)

        prev_indent = 0
        root = None
        parent = None
        cur = None

        for line in my_lines:
            try:

                if ("positive z-order list(" not in line
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
                        depth = (len(line) - len(line.lstrip(' ')))/2
                        target = json.JSONDecoder().decode(line)

                        if(depth == prev_indent and parent == None):
                            cur = dict([('value',target), ('depth',depth), ('children',[]), ('parent', parent)])
                            root = cur

                        if(depth == prev_indent and parent != None):
                            cur = dict([('value', target), ('depth', depth), ('children', []), ('parent', parent)])
                            parent['children'].append(cur)

                        if(depth > prev_indent):
                            # went deeper
                            parent = cur
                            child = dict([('value',target), ('depth',depth), ('children',[]), ('parent', parent)])
                            parent['children'].append(child)
                            # swith current node                            
                            cur = child

                        if(depth < prev_indent):
                            #went backwards
                            parentDepth = depth - 1
                            rootNode = root

                            for i in range(parentDepth):
                                rootNode = rootNode['children'][-1]
                            parent = rootNode
                            cur = dict([('value', target), ('depth', depth), ('children', []), ('parent', parent)])
                            parent['children'].append(cur)
               
                        prev_indent = depth
                        line_number += 1

                    except Exception, e:
                        print str(e)
                        print file, ", ", line_number, ", line:[ ", line, " ]"
            except Exception, e:
                print str(e)
                print file
                raise e

        toPixels(root, pixels_out, image.size[0], image.size[1])

        smp.imsave("./v2/meta/" + file_name + '.png', np.fliplr(np.rot90(pixels_out, 3)))
        print 'Saved'


if __name__ == '__main__':

    for file in files:
        checkFile(file)
