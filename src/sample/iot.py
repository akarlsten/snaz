from tsl2591 import Tsl2591
from machine import ADC, Pin, WDT
from network import WLAN
from dth import DTH
import pycom
import time
import ujson
import urequests

import secrets

pycom.heartbeat(False)

# If we fail to successfully POST results within a 32 minute window (allowing for retries) we will reset the device
wdt = WDT(timeout=1920000)

adc = ADC(bits=12)

time.timezone(3600)  # CET

INTEGRATIONTIME_100MS = 0x00
INTEGRATIONTIME_200MS = 0x01
GAIN_LOW = 0x00
GAIN_MED = 0x10

light_sensor = Tsl2591(1, INTEGRATIONTIME_100MS, GAIN_LOW)
soil_moisture_sensor = adc.channel(pin='P20', attn=ADC.ATTN_11DB)
temp_and_humidity_sensor = DTH(Pin('P22', mode=Pin.OPEN_DRAIN), 0)

while True:
    resultValid = False

    while not resultValid:
        pycom.rgbled(0x101000)  # yellow

        # increase the gain and exposure of light sensor at night
        currentHour = time.localtime()[3]
        if currentHour >= 6 and currentHour <= 18:
            light_sensor.set_timing(INTEGRATIONTIME_100MS)
            light_sensor.set_gain(GAIN_LOW)
        else:
            light_sensor.set_timing(INTEGRATIONTIME_200MS)
            light_sensor.set_gain(GAIN_MED)
        time.sleep(2)

        soil_moisture = soil_moisture_sensor()
        time.sleep(2)

        full, ir = light_sensor.get_full_luminosity()
        lux = light_sensor.calculate_lux(full, ir)
        time.sleep(2)

        result = temp_and_humidity_sensor.read()
        time.sleep(3)

        if result.is_valid():
            resultValid = True
            pycom.rgbled(0x00FF00)  # green

            results = {
                "timestamp": time.time(),
                "lux": lux,
                "temperature": result.temperature,
                "humidity": result.humidity,
                "soilMoisture": soil_moisture
            }

            jsonString = ujson.dumps(results)
            print(jsonString)
            request_url = secrets.secrets["url"]
            request_token = 'Bearer %s' % secrets.secrets["token"]

            # retry POST request 5 times
            i = 0
            while i < 5:
                try:
                    res = urequests.post(request_url, headers={
                        'content-type': 'application/json', 'Authorization': request_token}, data=jsonString)
                    print('Measurement POSTed successfully!')
                    res.close()
                    wdt.feed()  # reset the watchdog timer
                    i = 5
                except OSError as e:
                    i += 1
                    print('Error making POST request: %s' % str(e))
                    print('Retrying in 5 seconds.. Attempt: %s/5' % str(i + 1))
                    time.sleep(5)

            pycom.rgbled(0x000000)
        else:
            print("Sensor results invalid! Retrying in 5 seconds..")
            pycom.rgbled(0xFF0000)
            time.sleep(5)

    time.sleep(1800)  # 30 minutes
