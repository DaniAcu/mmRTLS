# mmRTLS Control Server

![image](https://user-images.githubusercontent.com/5400635/114650119-0d8a1200-9cb8-11eb-96fa-447b159cee4d.png)

The control server has the responsability to listen to incoming RSSI messages from the devices and calculate the device position according to a relative reference.

It's conformed by the following components:

- An MQTT Server, dockerized, which will provide the communication channel
- A Relational Database, such as MySql, where the device information will be stored
- A Processor service, which will be listening the device topics and process the device location to store in a database
- A CRUD REST service to consume the database with simple defined models.
- An App (not shown) which will provide a visual interface to visualize the REST API