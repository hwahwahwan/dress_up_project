#ifndef OUTFIT_H
#define OUTFIT_H

#include "hashmap.h"
#include "stack.h"
#include "linked_list.h"
#include "queue.h"

/* items.json 로딩 + 전역 자료구조 초기화 */
int  outfit_init(const char *items_json_path);
void outfit_cleanup(void);

/* API 핸들러 — 반환값은 malloc된 JSON 문자열, 호출자가 free() 해야 함 */
char *outfit_get_all_items(void);                        /* GET  /items            */
char *outfit_get_items_by_category(const char *category); /* GET  /items/:category  */
char *outfit_get_current(void);                          /* GET  /outfit           */
char *outfit_equip(int id);                              /* POST /equip/:id        */
char *outfit_unequip(const char *category);              /* POST /unequip/:category*/
char *outfit_undo(void);                                 /* POST /undo             */
char *outfit_reset(void);                                /* POST /reset            */
char *outfit_get_history(void);                          /* GET  /history          */

#endif
