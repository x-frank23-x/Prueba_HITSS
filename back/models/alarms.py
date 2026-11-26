from sqlalchemy import Table, Column, Integer, DateTime, String
from config.db import Base
from datetime import datetime


class Alarm(Base):
    __tablename__ = "alarms"
    # Creacion del modelo 
    # Aqui generamos los id de los datos de la alarma uno es el identificador
    # autogenerativo y el otro es el que se encuentra en el cv
    id = Column(Integer, primary_key=True, index=True)
    idAlarm = Column(Integer, unique=True, index=True, nullable=True)
    # pasamos a crear cada columna que tendra la tabla esto fuiandonos por el archivo cv
    tec2g = Column("2g", Integer, nullable=False)
    tec3g = Column("3g", Integer,nullable=False)
    tec4g = Column("4g", Integer ,nullable=False)
    #Aqui creamos las tablas de cada alarma que tiene esto guiandonos por 
    #Las columnas que hay en el arvhivo cv
    dateCreate = Column(DateTime, nullable=False, index=True)
    muni = Column(String(120), nullable=False)
    depa = Column(String(120), nullable=False)
    noti = Column(String(5), nullable=False)
    # aqui vamos a generar las columnas para medir el tiempo de duracion 
    # y tambien el estado de esta
    timeHours = Column(Integer, nullable= False)
    # Esta cikynab la generamos para poder tener una hora con minutos
    # un ejemplo seria 2h 34m
    timeText = Column(Integer, nullable=False)
    critical = Column(String(20), nullable=False, index=True) 
    # esta columba es oara saber cyabd se importó o guardó el registro en la base de datos
    # que es diferente a la que viene del cv
    importedAt = Column(DateTime, default=datetime.now, nullable=False)
    