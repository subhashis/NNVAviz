import numpy as np
import os
from matplotlib import pyplot as plt
from scipy import stats
from scipy.stats import norm
import sys
import math

wm1 = np.fromfile("weight_matrix/M3_dense_1.raw", dtype=np.dtype('float32'))
wm1 = wm1.reshape(35,1024)

wm2 = np.fromfile("weight_matrix/M3_dense_2.raw", dtype=np.dtype('float32'))
wm2 = wm2.reshape(1024,800)

wm3 = np.fromfile("weight_matrix/M3_dense_3.raw", dtype=np.dtype('float32'))
wm3 = wm3.reshape(800,500)

wm4 = np.fromfile("weight_matrix/M3_dense_4.raw", dtype=np.dtype('float32'))
wm4 = wm4.reshape(500,400)

para_imp = np.fromfile("weight_matrix/parameter_importance_final.raw")
para_imp = para_imp.reshape(500,35)



print(wm1.shape)
print(wm2.shape)
print(wm3.shape)
print(wm4.shape)
print(para_imp.shape)
