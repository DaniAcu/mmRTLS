# Wifi Beacon - repeater

Provides an additional (with know tssi) Access Point Beacon with the capacity to repeat wifi connection through a captive configuration portal.

![image](https://user-images.githubusercontent.com/5400635/132779592-81936042-5d32-4f71-ad7f-665dbd5cd9eb.png)

# ESP32 Environment Setup

Before to start with the project description, here is a brief guide about how to install and configure ESP-IDF for project building and flashing the ESP32 with Linux.


# Install prerequisites

To compile with ESP-IDF you need to get the following packages. The command to run depends on which distribution of Linux you are using:

Ubuntu and Debian:
```
sudo apt-get install git wget flex bison gperf python3 python3-pip python3-setuptools cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0
```

# Setup Linux toolchain from source

The following instructions are alternative to downloading binary toolchain from Espressif website. To quickly setup the binary toolchain, instead of compiling it yourself, backup and proceed to section Standard Setup of Toolchain for Linux.

```
NOTE
The reason you might need to build your own toolchain is to solve the Y2K38 problem 
(time_t expand to 64 bits instead of 32 bits).
```
# Install Prerequisites

To compile with ESP-IDF you need to get the following packages:
```
sudo apt-get install git wget libncurses-dev flex bison gperf python3 python3-pip python3-setuptools python3-serial python3-cryptography python3-future python3-pyparsing python3-pyelftools cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0

```
```
NOTE
CMake version 3.5 or newer is required for use with ESP-IDF. 
Older Linux distributions may require updating, enabling of a “backports” repository, 
or installing of a “cmake3” package rather than “cmake”.

```
# Compile the toolchain from source

Ubuntu 16.04 or newer:
```
sudo apt-get install gawk gperf grep gettext python python-dev automake bison flex texinfo help2man libtool libtool-bin make
```

Create the working directory and go into it:
```
mkdir -p ~/esp
cd ~/esp
```
Download crosstool-NG and build it:
```
git clone https://github.com/espressif/crosstool-NG.git
cd crosstool-NG
git checkout esp-2021r1
git submodule update --init
./bootstrap && ./configure --enable-local && make
```
```
NOTE
To create a toolchain with support for 64-bit time_t, you need to remove the --enable-newlib-long-time_t option from the crosstool-NG/samples/xtensa-esp32-elf/crosstool.config file in 33 and 43 lines.
```

Build the toolchain:
```
./ct-ng xtensa-esp32-elf
./ct-ng build
chmod -R u+w builds/xtensa-esp32-elf
```
Toolchain will be built in ~/esp/crosstool-NG/builds/xtensa-esp32-elf.
Add Toolchain to PATH

The custom toolchain needs to be copied to a binary directory and added to the PATH.

Choose a directory, for example ~/esp/xtensa-esp32-elf/, and copy the build output to this directory.

To use it, you will need to update your PATH environment variable in ~/.profile file. To make xtensa-esp32-elf available for all terminal sessions, add the following line to your ~/.profile file:
```
export PATH="$HOME/esp/xtensa-esp32-elf/bin:$PATH"
```
```
NOTE
If you have /bin/bash set as login shell, and both .bash_profile and .profile exist, 
then update .bash_profile instead. In CentOS, alias should set in .bashrc.
```

Log off and log in back to make the .profile changes effective. Run the following command to verify if PATH is correctly set:
```
printenv PATH
```
You are looking for similar result containing toolchain’s path at the beginning of displayed string:

```
$ printenv PATH
/home/user-name/esp/xtensa-esp32-elf/bin:/home/user-name/bin:/home/user-name/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

# Get ESP-IDF

Linux and macOS

Open Terminal, and run the following commands:
```
mkdir -p ~/esp
cd ~/esp
git clone --recursive https://github.com/espressif/esp-idf.git
```
ESP-IDF will be downloaded into ~/esp/esp-idf.

# Setup the tools
```
cd ~/esp/esp-idf
./install.sh
```
To prefer the Espressif download server when installing tools, use the following sequence of commands when running install.sh:

```
cd ~/esp/esp-idf
export IDF_GITHUB_ASSETS="dl.espressif.com/github_assets"
./install.sh
```

# Setup the environment variables

In the terminal where you are going to use ESP-IDF, run:

```
. $HOME/esp/esp-idf/export.sh
```

If you plan to use esp-idf frequently, you can create an alias for executing export.sh:

Copy and paste the following command to your shell’s profile (.profile, .bashrc, .zprofile, etc.)
```
    alias get_idf='. $HOME/esp/esp-idf/export.sh'
```
Refresh the configuration by restarting the terminal session or by running source [path to profile], for example, source ~/.bashrc.

Now you can run get_idf to set up or refresh the esp-idf environment in any terminal session.

# Configure and compile an example project

Now you are ready to prepare your application for ESP32. You can start with get-started/hello_world project from examples directory in IDF.

Copy the project get-started/hello_world to ~/esp directory:

```
cd ~/esp
cp -r $IDF_PATH/examples/get-started/hello_world .
```
NOTE: The projects need to be copied to that path in order to be built properly.


# Connect your device

Now connect your ESP32 board to the computer and check under what serial port the board is visible.

Serial ports have the following patterns in their names:

    Linux: starting with /dev/tty
    
# Configure

Navigate to your hello_world directory from Step 5. Start a Project, set ESP32 chip as the target and run the project configuration utility menuconfig.
Linux and macOS

```
cd ~/esp/hello_world
idf.py set-target esp32
idf.py menuconfig

```
Setting the target with idf.py set-target esp32 should be done once, after opening a new project. If the project contains some existing builds and configuration, they will be cleared and initialized. The target may be saved in environment variable to skip this step at all. See Selecting the Target for additional information.

If the previous steps have been done correctly, the following menu appears:

![image](https://user-images.githubusercontent.com/42529346/124537251-8b594780-dde7-11eb-8fed-df4ee118c791.png)


# Build the project

Build the project by running:

```
idf.py build
```
This command will compile the application and all ESP-IDF components, then it will generate the bootloader, partition table, and application binaries.
```
$ idf.py build
Running cmake in directory /path/to/hello_world/build
Executing "cmake -G Ninja --warn-uninitialized /path/to/hello_world"...
Warn about uninitialized values.
-- Found Git: /usr/bin/git (found version "2.17.0")
-- Building empty aws_iot component due to configuration
-- Component names: ...
-- Component paths: ...

... (more lines of build system output)

[527/527] Generating hello-world.bin
esptool.py v2.3.1

Project build complete. To flash, run this command:
../../../components/esptool_py/esptool/esptool.py -p (PORT) -b 921600 write_flash --flash_mode dio --flash_size detect --flash_freq 40m 0x10000 build/hello-world.bin  build 0x1000 build/bootloader/bootloader.bin 0x8000 build/partition_table/partition-table.bin
or run 'idf.py -p PORT flash'
```

If there are no errors, the build will finish by generating the firmware binary .bin files.
Step 9. Flash onto the Device

Flash the binaries that you just built (bootloader.bin, partition-table.bin and hello-world.bin) onto your ESP32 board by running:
```
idf.py -p PORT [-b BAUD] flash
```
Replace PORT with your ESP32 board’s serial port name from Step 6. Connect Your Device.

You can also change the flasher baud rate by replacing BAUD with the baud rate you need. The default baud rate is 460800.

You also can combine building, flashing and monitoring into one step by running:
```
idf.py -p PORT flash monitor
```
In my case was neccessary to setup the toolchain setup from scratch in order to achieve a successfull building, the here is described the steps required to build the toolchain:



# ESP32 NAT Router

This is a firmware to use the ESP32 as WiFi NAT router. It can be used as
- Simple range extender for an existing WiFi network
- Setting up an additional WiFi network with different SSID/password for guests or IOT devices

It can achieve a bandwidth of more than 15mbps.

The code is based on the [Console Component](https://docs.espressif.com/projects/esp-idf/en/latest/api-guides/console.html#console) and the [esp-idf-nat-example](https://github.com/jonask1337/esp-idf-nat-example). 

## Performance

All tests used `IPv4` and the `TCP` protocol.

| Board | Tools | Optimization | CPU Frequency | Throughput | Power |
| ----- | ----- | ------------ | ------------- | ---------- | ----- |
| `ESP32D0WDQ6` | `iperf3` | `0g` | `240MHz` | `16.0 MBits/s` | `1.6 W` |
| `ESP32D0WDQ6` | `iperf3` | `0s` | `240MHz` | `10.0 MBits/s` | `1.8 W` | 
| `ESP32D0WDQ6` | `iperf3` | `0g` | `160MHz` | `15.2 MBits/s` | `1.4 W` |
| `ESP32D0WDQ6` | `iperf3` | `0s` | `160MHz` | `14.1 MBits/s` | `1.5 W` |

## First Boot
After first boot the ESP32 NAT Router will offer a WiFi network with an open AP and the ssid "ESP32_NAT_Router". Configuration can either be done via a simple web interface or via the serial console. 

## Web Config Interface
The web interface allows for the configuration of all parameters. Connect you PC or smartphone to the WiFi SSID "ESP32_NAT_Router" and point your browser to "http://192.168.4.1". This page should appear:

<img src="https://raw.githubusercontent.com/martin-ger/esp32_nat_router/master/ESP32_NAT_UI2.JPG">

First enter the appropriate values for the uplink WiFi network, the "STA Settings". Leave password blank for open networks. Click "Connect". The ESP32 reboots and will connect to your WiFi router.

Now you can reconnect and reload the page and change the "Soft AP Settings". Click "Set" and again the ESP32 reboots. Now it is ready for forwarding traffic over the newly configured Soft AP. Be aware that these changes also affect the config interface, i.e. to do further configuration, connect to the ESP32 through one of the newly configured WiFi networks.

If you want to enter a '+' in the web interface you have to use HTTP-style hex encoding like "Mine%2bYours". This will result in a string "Mine+Yours". With this hex encoding you can enter any byte value you like, except for 0 (for C-internal reasons).

It you want to disable the web interface (e.g. for security reasons), go to the CLI and enter:
```
nvs_namespace esp32_nat
nvs_set lock str -v 1
```
After restart, no webserver is started any more. You can only re-enable it with:
```
nvs_namespace esp32_nat
nvs_set lock str -v 0
```
If you made a mistake and have lost all contact with the ESP you can still use the serial console to reconfigure it. All parameter settings are stored in NVS (non volatile storage), which is *not* erased by simple re-flashing the binaries. If you want to wipe it out, use "esptool.py -p /dev/ttyUSB0 erase_flash".

## Interpreting the on board LED

If the ESP32 is connected to the upstream AP then the on board LED should be on, otherwise off.
If there are devices connected to the ESP32 then the on board LED will keep blinking as many times as the number of devices connected.

For example:

One device connected to the ESP32, and the ESP32 is connected to upstream: 

`*****.*****`

Two devices are connected to the ESP32, but the ESP32 is not connected to upstream: 

`....*.*....`

# Command Line Interface

For configuration you have to use a serial console (Putty or GtkTerm with 115200 bps).
Use the "set_sta" and the "set_ap" command to configure the WiFi settings. Changes are stored persistently in NVS and are applied after next restart. Use "show" to display the current config. The NVS namespace for the parameters is "esp32_nat"

Enter the `help` command get a full list of all available commands:
```
help 
  Print the list of registered commands

free 
  Get the current size of free heap memory

heap 
  Get minimum size of free heap memory that was available during program execu
  tion

version 
  Get version of chip and SDK

restart 
  Software reset of the chip

deep_sleep  [-t <t>] [--io=<n>] [--io_level=<0|1>]
  Enter deep sleep mode. Two wakeup modes are supported: timer and GPIO. If no
  wakeup option is specified, will sleep indefinitely.
  -t, --time=<t>  Wake up time, ms
      --io=<n>  If specified, wakeup using GPIO with given number
  --io_level=<0|1>  GPIO level to trigger wakeup

light_sleep  [-t <t>] [--io=<n>]... [--io_level=<0|1>]...
  Enter light sleep mode. Two wakeup modes are supported: timer and GPIO. Mult
  iple GPIO pins can be specified using pairs of 'io' and 'io_level' arguments
  . Will also wake up on UART input.
  -t, --time=<t>  Wake up time, ms
      --io=<n>  If specified, wakeup using GPIO with given number
  --io_level=<0|1>  GPIO level to trigger wakeup

tasks 
  Get information about running tasks

nvs_set  <key> <type> -v <value>
  Set key-value pair in selected namespace.
Examples:
 nvs_set VarName i32 -v 
  123 
 nvs_set VarName str -v YourString 
 nvs_set VarName blob -v 0123456789abcdef 
         <key>  key of the value to be set
        <type>  type can be: i8, u8, i16, u16 i32, u32 i64, u64, str, blob
  -v, --value=<value>  value to be stored

nvs_get  <key> <type>
  Get key-value pair from selected namespace. 
Example: nvs_get VarName i32
         <key>  key of the value to be read
        <type>  type can be: i8, u8, i16, u16 i32, u32 i64, u64, str, blob

nvs_erase  <key>
  Erase key-value pair from current namespace
         <key>  key of the value to be erased

nvs_namespace  <namespace>
  Set current namespace
   <namespace>  namespace of the partition to be selected

nvs_list  <partition> [-n <namespace>] [-t <type>]
  List stored key-value pairs stored in NVS.Namespace and type can be specified
  to print only those key-value pairs.
  
Following command list variables stored inside 'nvs' partition, under namespace 'storage' with type uint32_t
  Example: nvs_list nvs -n storage -t u32 

   <partition>  partition name
  -n, --namespace=<namespace>  namespace name
  -t, --type=<type>  type can be: i8, u8, i16, u16 i32, u32 i64, u64, str, blob

nvs_erase_namespace  <namespace>
  Erases specified namespace
   <namespace>  namespace to be erased

set_sta  <ssid> <passwd>
  Set SSID and password of the STA interface
        <ssid>  SSID
      <passwd>  Password

set_sta_static  <ip> <subnet> <gw>
  Set Static IP for the STA interface
          <ip>  IP
      <subnet>  Subnet Mask
          <gw>  Gateway Address

set_ap  <ssid> <passwd>
  Set SSID and password of the SoftAP
        <ssid>  SSID of AP
      <passwd>  Password of AP

set_ap_ip  <ip>
  Set IP for the AP interface
          <ip>  IP

portmap  [add|del] [TCP|UDP] <ext_portno> <int_ip> <int_portno>
  Add or delete a portmapping to the router
     [add|del]  add or delete portmapping
     [TCP|UDP]  TCP or UDP port
  <ext_portno>  external port number
      <int_ip>  internal IP
  <int_portno>  internal port number

show 
  Get status and config of the router
```

If you want to enter non-ASCII or special characters (incl. ' ') you can use HTTP-style hex encoding (e.g. "My%20AccessPoint" results in a string "My AccessPoint").

## Flashing the prebuild Binaries
Install [esptool](https://github.com/espressif/esptool), go to the project directory, and enter:
```
esptool.py --chip esp32 --port /dev/ttyUSB0 \
--baud 115200 --before default_reset --after hard_reset write_flash \
-z --flash_mode dio --flash_freq 40m --flash_size detect \
0x1000 build/bootloader/bootloader.bin \
0x10000 build/esp32_nat_router.bin \
0x8000 build/partitions_example.bin
```

As an alternative you might use [Espressif's Flash Download Tools](https://www.espressif.com/en/products/hardware/esp32/resources) with the parameters given in the figure below (thanks to mahesh2000):

![image](https://raw.githubusercontent.com/martin-ger/esp32_nat_router/master/FlasherUI.jpg)

## Building the Binaries
The following are the steps required to compile this project:

1. Download and setup the ESP-IDF.

2. In the project directory run `make menuconfig` (or `idf.py menuconfig` for cmake).
    1. *Component config -> LWIP > [x] Enable copy between Layer2 and Layer3 packets.
    2. *Component config -> LWIP > [x] Enable IP forwarding.
    3. *Component config -> LWIP > [x] Enable NAT (new/experimental).
3. Build the project and flash it to the ESP32.

A detailed instruction on how to build, configure and flash a ESP-IDF project can also be found the official ESP-IDF guide. 

## Troubleshooting

### Line Endings

The line endings in the Console Example are configured to match particular serial monitors. Therefore, if the following log output appears, consider using a different serial monitor (e.g. Putty for Windows or GtkTerm on Linux) or modify the example's UART configuration.

```
This is an example of ESP-IDF console component.
Type 'help' to get the list of commands.
Use UP/DOWN arrows to navigate through command history.
Press TAB when typing command name to auto-complete.
Your terminal application does not support escape sequences.
Line editing and history features are disabled.
On Windows, try using Putty instead.
esp32>
```

