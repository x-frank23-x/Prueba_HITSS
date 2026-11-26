import csv
import io
from datetime import datetime

MONTH = {
    "JAN": 1,
    "FEB": 2,
    "MAR": 3,
    "APR": 4,
    "MAY": 5,
    "JUN": 6,
    "JUL": 7,
    "AUG": 8,
    "SEP": 9,
    "OCT": 10,
    "NOV": 11,
    "DEC": 12,
}

def parseDate(textDate:str)-> datetime:
    
    clean=textDate.strip().strip('"')
    parts = clean.split()
    
    dateParts = parts[0]
    hourParts = parts[1]
    ampm = parts[2]
    
    dayStr, monthStr, yearStr = dateParts.split("-")
    day= int(dayStr)
    month= MONTH[monthStr.upper()]
    year = 2000 + int(yearStr)
    
    piecesHour = hourParts.split(".")
    hour = int(piecesHour[0])
    minute = int(piecesHour[1])
    second = int(piecesHour[2])
    
    microsecond = 0
    
    if len(piecesHour) > 3:
        subseg= piecesHour[3] [:6].ljust(6, "0")
        microsecond = int(subseg)
        
    if ampm.upper() == "PM" and hour < 12:
        hour += 12
    elif ampm.upper() == "AM" and hour == 12:
        hour = 0
        
    return datetime(year, month, day, hour, minute, second, microsecond)

def readAlamarCsv(contentBytes:bytes)-> list[dict]:
    text= contentBytes.decode("utf-8")
    fileMemory= io.StringIO(text)
    reader=csv.DictReader(fileMemory,delimiter="|")
    
    alarms=[]
    for row in reader:
        if not row.get("ID_ALARMA"):
            continue    
        alarm={
            "idAlarm": int(row["ID_ALARMA"].strip()),
            "tec2g": int(row["2G"].strip()),
            "tec3g": int(row["3G"].strip()),
            "tec4g": int(row["4G"].strip()),
            "dateCreate": parseDate(row["FECHA_CREACION"].strip()),
            "muni": row["MUNICIPIO"].strip(),
            "depa": row["DEPARTAMENTO"].strip(""),
            "noti": row["NOTIFICADA"].strip(""),
        }
        alarms.append(alarm)
    return alarms