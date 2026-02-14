#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Jun 14 10:38:31 2020

@author: guoyi
"""
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat May 23 22:59:40 2020

@author: guoyi
"""
import json

with open('eventsequence.json','r') as f:
    data=json.load(f)
    print(data)

data[1].append({'URL':''})
#%%
for i in range(0,len(data)):
    if ',' in data[i]['Interaction']:
        data[i]['Interaction']=data[i]['Interaction'].split(',')
print(data[2]['Interaction'])
#%%
for i in range(0,len(data)):
    if ',' in data[i]['Domain']:
        data[i]['Domain']=data[i]['Domain'].split(',')
print(data[2]['Domain'])
#%%
for i in range(0,len(data)):
    if ',' in data[i]['Visualization']:
        data[i]['Visualization']=data[i]['Visualization'].split(',')
print(data[2]['Visualization'])
#%%
for i in range(0,len(data)):
    data[i]['years']=str(data[i]['years'])
#%%
for i in range(0,len(data)):
    data[i]['id']=str(data[i]['id'])
    #%%
for i in range(0,len(data)):
    if ',' in data[i]['Task']:
        data[i]['Task']=data[i]['Task'].split(',')
    #%%
with open("eventsequence2.json","w") as f:
    json.dump(data,f,indent=4)
#%%
import json
import os
with open('eventsequence2.json','r') as f:
    data=json.load(f)
#%%   
filelist = os.listdir('../Figure')
pic=[]
for j in range(0,len(filelist)):
    pic.append(filelist[j][:-4])

papername=[]
for i in range(0,len(data)):
    papername.append(data[i]['Name'])
    
a=list(set(papername).difference(set(pic)))
print(a)
#%%
import json
import os
with open('eventsequence2.json','r') as f:
    data=json.load(f)
    
filelist = os.listdir('../Figure')
for i in range(0,len(data)):
    jsname=data[i]['Name']
    for j in range(0,len(filelist)):
        picname=filelist[j][:-4]
        if jsname==picname:
            os.rename('../Figure/'+filelist[j], '../Figure/'+data[i]['id'] +".png" )
            
        #%%
import json

with open('eventsequence6.json','r') as f:
    data=json.load(f)
 #%%   
for i in range(0,len(data)):
    a=data[i]['Visualization']      
    for j in range (0, len(a)):
        b=a[j]      
        if ' ' in b:
             data[i]['Visualization'][j]=b[1:]



with open("eventsequence6.json","w") as f:
    json.dump(data,f,indent=4)            
            
       
