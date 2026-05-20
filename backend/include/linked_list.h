#ifndef LINKED_LIST_H
#define LINKED_LIST_H

#include "hashmap.h"  /* Item 타입 사용 */

typedef struct ListNode {
    Item             item;
    struct ListNode *next;
} ListNode;

typedef struct {
    ListNode *head;
    int       size;
} LinkedList;

LinkedList *linked_list_create(void);
void        linked_list_destroy(LinkedList *list);

/* 레이어 순서 끝에 추가 (equip 시) */
void        linked_list_append(LinkedList *list, Item item);

/* 해당 카테고리 아이템 제거 (unequip 시) */
void        linked_list_remove_by_category(LinkedList *list, const char *category);

/* 해당 카테고리 아이템 조회 — 없으면 NULL */
Item       *linked_list_get_by_category(LinkedList *list, const char *category);

/* 전체 초기화 (reset 시) */
void        linked_list_clear(LinkedList *list);

#endif
