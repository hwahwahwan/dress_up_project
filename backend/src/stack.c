#include <stdlib.h>
#include "stack.h"

/* 빈 상태 반환 — 스택이 비었을 때 pop/peek 기본값 */
static OutfitState empty_state(void) {
    OutfitState s = { -1, -1, -1, -1 };
    return s;
}

Stack *stack_create(void) {
    Stack *s = malloc(sizeof(Stack));
    if (!s) return NULL;
    s->top  = NULL;
    s->size = 0;
    return s;
}

void stack_destroy(Stack *s) {
    if (!s) return;
    StackNode *node = s->top;
    while (node) {
        StackNode *next = node->next;
        free(node);
        node = next;
    }
    free(s);
}

/* 현재 착용 상태를 스택에 push (equip/unequip/reset 호출 전에 저장) */
void stack_push(Stack *s, OutfitState state) {
    StackNode *node = malloc(sizeof(StackNode));
    if (!node) return;
    node->state = state;
    node->next  = s->top;
    s->top      = node;
    s->size++;
}

/* 직전 상태를 꺼내 반환 — 스택이 비었으면 empty_state */
OutfitState stack_pop(Stack *s) {
    if (stack_is_empty(s)) return empty_state();
    StackNode  *node  = s->top;
    OutfitState state = node->state;
    s->top = node->next;
    free(node);
    s->size--;
    return state;
}

OutfitState stack_peek(const Stack *s) {
    if (stack_is_empty(s)) return empty_state();
    return s->top->state;
}

int stack_is_empty(const Stack *s) {
    return s->top == NULL;
}
