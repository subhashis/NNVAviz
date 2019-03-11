import numpy as np
import os
from matplotlib import pyplot as plt
from scipy import stats
from scipy.stats import norm
import sys
import math

def main(type):
    if type == 'm1':
        wm1 = np.fromfile("data/weight_matrix/M3_dense_1.raw", dtype=np.dtype('float32'))
        wm1 = wm1.reshape(35,1024)
        return wm1
    elif type == 'm2':
        wm2 = np.fromfile("data/weight_matrix/M3_dense_2.raw", dtype=np.dtype('float32'))
        wm2 = wm2.reshape(1024,800)
        return wm2
    elif type == 'm3':
        wm3 = np.fromfile("data/weight_matrix/M3_dense_3.raw", dtype=np.dtype('float32'))
        wm3 = wm3.reshape(800,500)
        return wm3
    elif type == 'm4':
        wm4 = np.fromfile("data/weight_matrix/M3_dense_4.raw", dtype=np.dtype('float32'))
        wm4 = wm4.reshape(500,400)
        return wm4
    elif type == 'mp':
        para_imp = np.fromfile("data/weight_matrix/parameter_importance_final.raw")
        para_imp = para_imp.reshape(500,35)
        return para_imp



# print(wm1)
# print(wm2.shape)
# print(wm3.shape)
# print(wm4.shape)
# print(para_imp.shape)
