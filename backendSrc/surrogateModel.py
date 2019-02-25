import numpy as np
import os
#from matplotlib import pyplot as plt
import sys
import math
import json
import pandas as pd

import keras
from keras.models import load_model

import keras.backend as K

#class to enable uncertainty quantification with NN
class KerasDropoutPrediction(object):
    def __init__(self,model):
        self.f = K.function(
                [model.layers[0].input, 
                 K.learning_phase()],
                [model.layers[-1].output])
    def predict(self,x, n_iter=10):
        result = []
        for _ in range(n_iter):
            result.append(self.f([x , 1]))
        result = np.array(result).reshape(n_iter,400)
        return result

#the predictor function
#input : KerasDropoutPrediction object, and (35,) size input numpy array 
#output: Mean predicted protein values(400,), Std deviation of the predicted values (400,) 
def dropout_predictor(m_object, param_in):
    new_input = np.zeros((1,35))
    for i in range(0,35):
        new_input[0][i] = param_in[i]
    y_pred = m_object.predict(new_input,n_iter=100)
    y_pred_mean = y_pred.mean(axis=0)
    y_pred_std = y_pred.std(axis=0)
    return y_pred_mean,y_pred_std

#load the trained NN surrogate model
M3 = load_model('./new_MLP_yeast_35_1024_800_500_400_epochs5000_dropout_datasize_3000_split_0_1.h5')

#printout the model configuration
M3.summary()

#create the objects for dropout predictor
M3_dp_predictor = KerasDropoutPrediction(M3)

def main(input_parameter):
    #this will come from the NNVA d3 dashboard
    # input_parameter = np.zeros((35,))

    #dummy test case
    # input_parameter = np.array([ 0.799611,  0.191463,  0.308464,  0.207551,  0.074747,  0.949241,  0.580422,  
    # 	0.791716, -0.473602, -0.025531, -0.314472, 0.862159, -0.239092, -0.712813,
    #  -0.225801, -0.334405, -0.609486, -0.518853, -0.503734, -0.897176,  0.979674,
    #   0.017872,  0.943028, -0.356691,  0.656346, -0.217127,  0.782005,  0.143829,
    #  -0.535368, -0.205101,  0.626929,  0.357102,  0.813448, -0.859384,  0.635532])

    #actual call to the predictor
    mean_outcome, std_outcome = dropout_predictor(M3_dp_predictor,input_parameter)

    #create a json object
    NNVA_dict = {'curve_mean': mean_outcome.tolist(), 'curve_std': std_outcome.tolist()}

    # #sanity check only
    # print("MEAN:")
    # print(mean_outcome)
    # print("STD:")
    # print(std_outcome)

    # #write to a json file
    # with open('NNVA_preview.json', 'w') as fp:
    #     json.dump(NNVA_dict, fp)

    return NNVA_dict

