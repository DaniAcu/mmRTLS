#ifndef  UTILS_H
#define  UTILS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>


char *utilsMAC2str( uint8_t *mac_addr, char *dst, size_t ndst );
int utils_str2MAC( char *s, uint8_t *dst );

#endif //UTILS_H
