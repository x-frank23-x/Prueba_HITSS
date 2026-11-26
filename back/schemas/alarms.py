from datetime import datetime 
from typing import Literal
from pydantic import BaseModel, ConfigDict

CriticalType = Literal["NORMAL","WARN","CRITICAL"]

# la base de cada alarma
class AlarmBase(BaseModel):
    idAlarm: int
    tec2g: int
    tec3g: int
    tec4g: int
    dateCreate: datetime
    muni: str
    depa: str
    noti: str
    
# extension de alarmbase para agregar campos para manejarlo mejor
class AlarmResponse(AlarmBase):
    id:int
    timeHours:float
    timeText:str
    critical:CriticalType
    model_config = ConfigDict(from_attributes=True)
    
class AlarmCreate(BaseModel):
    idAlarm: int
    tec2g: int
    tec3g: int
    tec4g: int
    dateCreate: datetime
    muni: str
    depa: str
    noti: str
 #   
class ImportResponse(BaseModel):
    fileName:str
    totalProcessed:int
    items:list[AlarmResponse]
    
class HourlyCount(BaseModel):
    hour:str
    amount:int
    
class DailySummaryResponse(BaseModel):
    date:str
    totalDay:int
    perHour:list[HourlyCount]