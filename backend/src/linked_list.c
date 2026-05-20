#include <stdlib.h>
#include <string.h>
#include "linked_list.h"

LinkedList *linked_list_create(void) {
    LinkedList *list = malloc(sizeof(LinkedList));
    if (!list) return NULL;
    list->head = NULL;
    list->size = 0;
    return list;
}

void linked_list_destroy(LinkedList *list) {
    if (!list) return;
    linked_list_clear(list);
    free(list);
}

/* 같은 카테고리가 이미 있으면 교체, 없으면 맨 뒤에 추가 */
void linked_list_append(LinkedList *list, Item item) {
    ListNode *node = list->head;
    while (node) {
        if (strcmp(node->item.category, item.category) == 0) {
            node->item = item;
            return;
        }
        node = node->next;
    }
    ListNode *new_node = malloc(sizeof(ListNode));
    if (!new_node) return;
    new_node->item = item;
    new_node->next = NULL;

    if (!list->head) {
        list->head = new_node;
    } else {
        ListNode *tail = list->head;
        while (tail->next) tail = tail->next;
        tail->next = new_node;
    }
    list->size++;
}

void linked_list_remove_by_category(LinkedList *list, const char *category) {
    ListNode *node = list->head;
    ListNode *prev = NULL;
    while (node) {
        if (strcmp(node->item.category, category) == 0) {
            if (prev)
                prev->next = node->next;
            else
                list->head = node->next;
            free(node);
            list->size--;
            return;
        }
        prev = node;
        node = node->next;
    }
}

Item *linked_list_get_by_category(LinkedList *list, const char *category) {
    ListNode *node = list->head;
    while (node) {
        if (strcmp(node->item.category, category) == 0)
            return &node->item;
        node = node->next;
    }
    return NULL;
}

void linked_list_clear(LinkedList *list) {
    ListNode *node = list->head;
    while (node) {
        ListNode *next = node->next;
        free(node);
        node = next;
    }
    list->head = NULL;
    list->size = 0;
}
