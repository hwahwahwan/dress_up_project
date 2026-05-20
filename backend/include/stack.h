#ifndef STACK_H
#define STACK_H

/* 카테고리별 착용 아이템 ID 스냅샷 (-1 이면 미착용) */
typedef struct {
    int tops_id;
    int bottoms_id;
    int shoes_id;
    int accessories_id;
} OutfitState;

typedef struct StackNode {
    OutfitState       state;
    struct StackNode *next;
} StackNode;

typedef struct {
    StackNode *top;
    int        size;
} Stack;

Stack      *stack_create(void);
void        stack_destroy(Stack *s);
void        stack_push(Stack *s, OutfitState state);
OutfitState stack_pop(Stack *s);
OutfitState stack_peek(const Stack *s);
int         stack_is_empty(const Stack *s);

#endif
