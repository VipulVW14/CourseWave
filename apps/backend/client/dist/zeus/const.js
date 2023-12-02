"use strict";
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ops = exports.ReturnTypes = exports.AllTypesProps = void 0;
exports.AllTypesProps = {
    Int_comparison_exp: {},
    String_comparison_exp: {},
    courses_aggregate_fields: {
        count: {
            columns: "courses_select_column"
        }
    },
    courses_bool_exp: {
        _and: "courses_bool_exp",
        _not: "courses_bool_exp",
        _or: "courses_bool_exp",
        description: "String_comparison_exp",
        id: "uuid_comparison_exp",
        imageLink: "String_comparison_exp",
        price: "Int_comparison_exp",
        title: "String_comparison_exp"
    },
    courses_constraint: "enum",
    courses_inc_input: {},
    courses_insert_input: {
        id: "uuid"
    },
    courses_on_conflict: {
        constraint: "courses_constraint",
        update_columns: "courses_update_column",
        where: "courses_bool_exp"
    },
    courses_order_by: {
        description: "order_by",
        id: "order_by",
        imageLink: "order_by",
        price: "order_by",
        title: "order_by"
    },
    courses_pk_columns_input: {
        id: "uuid"
    },
    courses_select_column: "enum",
    courses_set_input: {
        id: "uuid"
    },
    courses_stream_cursor_input: {
        initial_value: "courses_stream_cursor_value_input",
        ordering: "cursor_ordering"
    },
    courses_stream_cursor_value_input: {
        id: "uuid"
    },
    courses_update_column: "enum",
    courses_updates: {
        _inc: "courses_inc_input",
        _set: "courses_set_input",
        where: "courses_bool_exp"
    },
    cursor_ordering: "enum",
    mutation_root: {
        delete_courses: {
            where: "courses_bool_exp"
        },
        delete_courses_by_pk: {
            id: "uuid"
        },
        delete_users: {
            where: "users_bool_exp"
        },
        delete_users_by_pk: {},
        insert_courses: {
            objects: "courses_insert_input",
            on_conflict: "courses_on_conflict"
        },
        insert_courses_one: {
            object: "courses_insert_input",
            on_conflict: "courses_on_conflict"
        },
        insert_users: {
            objects: "users_insert_input",
            on_conflict: "users_on_conflict"
        },
        insert_users_one: {
            object: "users_insert_input",
            on_conflict: "users_on_conflict"
        },
        update_courses: {
            _inc: "courses_inc_input",
            _set: "courses_set_input",
            where: "courses_bool_exp"
        },
        update_courses_by_pk: {
            _inc: "courses_inc_input",
            _set: "courses_set_input",
            pk_columns: "courses_pk_columns_input"
        },
        update_courses_many: {
            updates: "courses_updates"
        },
        update_users: {
            _set: "users_set_input",
            where: "users_bool_exp"
        },
        update_users_by_pk: {
            _set: "users_set_input",
            pk_columns: "users_pk_columns_input"
        },
        update_users_many: {
            updates: "users_updates"
        }
    },
    order_by: "enum",
    query_root: {
        courses: {
            distinct_on: "courses_select_column",
            order_by: "courses_order_by",
            where: "courses_bool_exp"
        },
        courses_aggregate: {
            distinct_on: "courses_select_column",
            order_by: "courses_order_by",
            where: "courses_bool_exp"
        },
        courses_by_pk: {
            id: "uuid"
        },
        users: {
            distinct_on: "users_select_column",
            order_by: "users_order_by",
            where: "users_bool_exp"
        },
        users_aggregate: {
            distinct_on: "users_select_column",
            order_by: "users_order_by",
            where: "users_bool_exp"
        },
        users_by_pk: {}
    },
    subscription_root: {
        courses: {
            distinct_on: "courses_select_column",
            order_by: "courses_order_by",
            where: "courses_bool_exp"
        },
        courses_aggregate: {
            distinct_on: "courses_select_column",
            order_by: "courses_order_by",
            where: "courses_bool_exp"
        },
        courses_by_pk: {
            id: "uuid"
        },
        courses_stream: {
            cursor: "courses_stream_cursor_input",
            where: "courses_bool_exp"
        },
        users: {
            distinct_on: "users_select_column",
            order_by: "users_order_by",
            where: "users_bool_exp"
        },
        users_aggregate: {
            distinct_on: "users_select_column",
            order_by: "users_order_by",
            where: "users_bool_exp"
        },
        users_by_pk: {},
        users_stream: {
            cursor: "users_stream_cursor_input",
            where: "users_bool_exp"
        }
    },
    users_aggregate_fields: {
        count: {
            columns: "users_select_column"
        }
    },
    users_bool_exp: {
        _and: "users_bool_exp",
        _not: "users_bool_exp",
        _or: "users_bool_exp",
        password: "String_comparison_exp",
        username: "String_comparison_exp"
    },
    users_constraint: "enum",
    users_insert_input: {},
    users_on_conflict: {
        constraint: "users_constraint",
        update_columns: "users_update_column",
        where: "users_bool_exp"
    },
    users_order_by: {
        password: "order_by",
        username: "order_by"
    },
    users_pk_columns_input: {},
    users_select_column: "enum",
    users_set_input: {},
    users_stream_cursor_input: {
        initial_value: "users_stream_cursor_value_input",
        ordering: "cursor_ordering"
    },
    users_stream_cursor_value_input: {},
    users_update_column: "enum",
    users_updates: {
        _set: "users_set_input",
        where: "users_bool_exp"
    },
    uuid: `scalar.uuid`,
    uuid_comparison_exp: {
        _eq: "uuid",
        _gt: "uuid",
        _gte: "uuid",
        _in: "uuid",
        _lt: "uuid",
        _lte: "uuid",
        _neq: "uuid",
        _nin: "uuid"
    }
};
exports.ReturnTypes = {
    cached: {
        ttl: "Int",
        refresh: "Boolean"
    },
    courses: {
        description: "String",
        id: "uuid",
        imageLink: "String",
        price: "Int",
        title: "String"
    },
    courses_aggregate: {
        aggregate: "courses_aggregate_fields",
        nodes: "courses"
    },
    courses_aggregate_fields: {
        avg: "courses_avg_fields",
        count: "Int",
        max: "courses_max_fields",
        min: "courses_min_fields",
        stddev: "courses_stddev_fields",
        stddev_pop: "courses_stddev_pop_fields",
        stddev_samp: "courses_stddev_samp_fields",
        sum: "courses_sum_fields",
        var_pop: "courses_var_pop_fields",
        var_samp: "courses_var_samp_fields",
        variance: "courses_variance_fields"
    },
    courses_avg_fields: {
        price: "Float"
    },
    courses_max_fields: {
        description: "String",
        id: "uuid",
        imageLink: "String",
        price: "Int",
        title: "String"
    },
    courses_min_fields: {
        description: "String",
        id: "uuid",
        imageLink: "String",
        price: "Int",
        title: "String"
    },
    courses_mutation_response: {
        affected_rows: "Int",
        returning: "courses"
    },
    courses_stddev_fields: {
        price: "Float"
    },
    courses_stddev_pop_fields: {
        price: "Float"
    },
    courses_stddev_samp_fields: {
        price: "Float"
    },
    courses_sum_fields: {
        price: "Int"
    },
    courses_var_pop_fields: {
        price: "Float"
    },
    courses_var_samp_fields: {
        price: "Float"
    },
    courses_variance_fields: {
        price: "Float"
    },
    mutation_root: {
        delete_courses: "courses_mutation_response",
        delete_courses_by_pk: "courses",
        delete_users: "users_mutation_response",
        delete_users_by_pk: "users",
        insert_courses: "courses_mutation_response",
        insert_courses_one: "courses",
        insert_users: "users_mutation_response",
        insert_users_one: "users",
        update_courses: "courses_mutation_response",
        update_courses_by_pk: "courses",
        update_courses_many: "courses_mutation_response",
        update_users: "users_mutation_response",
        update_users_by_pk: "users",
        update_users_many: "users_mutation_response"
    },
    query_root: {
        courses: "courses",
        courses_aggregate: "courses_aggregate",
        courses_by_pk: "courses",
        users: "users",
        users_aggregate: "users_aggregate",
        users_by_pk: "users"
    },
    subscription_root: {
        courses: "courses",
        courses_aggregate: "courses_aggregate",
        courses_by_pk: "courses",
        courses_stream: "courses",
        users: "users",
        users_aggregate: "users_aggregate",
        users_by_pk: "users",
        users_stream: "users"
    },
    users: {
        password: "String",
        username: "String"
    },
    users_aggregate: {
        aggregate: "users_aggregate_fields",
        nodes: "users"
    },
    users_aggregate_fields: {
        count: "Int",
        max: "users_max_fields",
        min: "users_min_fields"
    },
    users_max_fields: {
        password: "String",
        username: "String"
    },
    users_min_fields: {
        password: "String",
        username: "String"
    },
    users_mutation_response: {
        affected_rows: "Int",
        returning: "users"
    },
    uuid: `scalar.uuid`
};
exports.Ops = {
    query: "query_root",
    mutation: "mutation_root",
    subscription: "subscription_root"
};
