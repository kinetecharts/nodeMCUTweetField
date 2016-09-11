/*
 * 31 mar 2015
 * http://www.esp8266.com/viewtopic.php?f=29&t=2222
 * This sketch display UDP packets coming from an UDP client.
 * On a Mac the NC command can be used to send UDP. (nc -u 192.168.1.101 12345). 
 *
 * Configuration : Enter the ssid and password of your Wifi AP. Enter the port number your server is listening on.
 *
 */
#include <ESP8266WiFi.h>
#include <WiFiUDP.h>

extern "C" {  //required for read Vdd Voltage
#include "user_interface.h"
#include "SimpleTimer.h"
  // uint16 readvdd33(void);
}

int ID = 12;
int PIN_RELAY=4; //actually 2
int PIN_LED=5;

int status = WL_IDLE_STATUS;
const char* ssid = "kineviz_test";  //  your network SSID (name)
const char* pass = "12345678";       // your network password
const char* serverIP="192.168.0.101"; //server to send my info
//const char* ssid = "election";  //  your network SSID (name)
//const char* pass = "12345678";       // your network password
//const char* serverIP="192.168.0.100"; //server to send my info
unsigned int serverPort = 12346;

unsigned int localPort = 12345;      // local port to listen for UDP packets

SimpleTimer timer;

byte packetBuffer[512]; //buffer to hold incoming and outgoing packets

// A UDP instance to let us send and receive packets over UDP
WiFiUDP Udp;

void setup()
{
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  // Open serial communications and wait for port to open:
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // setting up Station AP
  WiFi.begin(ssid, pass);
  
  // Wait for connect to AP
  Serial.print("[Connecting]");
  Serial.print(ssid);
  int tries=0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    tries++;
    if (tries > 30){
      break;
    }
  }
  Serial.println();


  printWifiStatus();

  Serial.println("Connected to wifi");
  Serial.print("Udp server started at port ");
  Serial.println(localPort);
  Udp.begin(localPort);
  digitalWrite(PIN_RELAY, HIGH);
  digitalWrite(PIN_LED, HIGH);
  delay(1000);
  digitalWrite(PIN_RELAY, LOW);
  digitalWrite(PIN_LED, LOW);

  timer.setInterval(3000, heartBeat);
}

void loop()
{
  timer.run();

  int noBytes = Udp.parsePacket();
  String received_command = "";
  
  if ( noBytes ) {
    Serial.print(millis() / 1000);
    Serial.print(":Packet of ");
    Serial.print(noBytes);
    Serial.print(" received from ");
    Serial.print(Udp.remoteIP());
    Serial.print(":");
    Serial.println(Udp.remotePort());
    // We've received a packet, read the data from it
    Udp.read(packetBuffer,noBytes); // read the packet into the buffer

    // display the packet contents in HEX
    for (int i=1;i<=noBytes;i++)
    {
      Serial.print(packetBuffer[i-1],HEX);
      received_command = received_command + char(packetBuffer[i - 1]);
      if (i % 32 == 0)
      {
        Serial.println();
      }
      else Serial.print(' ');
    } // end for
    Serial.println();
    
//    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
//    Udp.beginPacket(serverIP, serverPort);
//    Udp.write("Answer from ESP8266 ChipID#");
//    Udp.print(system_get_chip_id());
//    Udp.write("#IP of ESP8266#");
//    Udp.print(WiFi.localIP());
//    Udp.write("#ID:");
//    Udp.println(ID);
//    Udp.endPacket();
    
    Serial.println(received_command);
    Serial.println();
    
    digitalWrite(PIN_RELAY, HIGH);
    digitalWrite(PIN_LED, HIGH);
    delay(100);
    digitalWrite(PIN_RELAY, LOW);
    digitalWrite(PIN_LED, LOW);
    
  } // end if


}

void heartMonitor(){
  int sensorValue = analogRead(A0);
    Udp.beginPacket(serverIP, serverPort);
    Udp.write("ecg ");
    Udp.println(sensorValue);
    Udp.endPacket();
}

void heartBeat(){
  Udp.beginPacket(serverIP, serverPort);
  Udp.write("Heartbeat from ESP8266 ID:");
  Udp.print(ID);
  Udp.write(" #IP:");
  Udp.print(WiFi.localIP());
  Udp.println();
  Udp.endPacket();
  
  Serial.println("Heatbeat sent to server");
  Serial.println();
    
}


void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

