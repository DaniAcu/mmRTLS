#ifndef WTD_H_
#define WTD_H_

#include "stdint.h"
#include "esp_task_wdt.h"

void wtdInitTask(uint8_t time);
void wtdSubscribeTask(void);
void wtdFeed(void);
#endif