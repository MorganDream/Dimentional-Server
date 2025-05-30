## Database Tables

### user
> | 字段        | 类型               | 约束               | 说明  |
> |:-----|:------|:--------|:----|
> |openid | string | 主键 不空 自增 | 来自qq.codetosession获取，qq用户唯一id |
> |name | string | | 初始为用户昵称，可修改 | 
> |gender | number | | 0, unknow; 1 male, 2 female|
> |avatar |string | | 头像|
> |roles| string | |`${role1};${role2}...` | 
> |location|||下鼠标|
> |feeds | ||下属表|

### location
> |字段|字段类型|说明|
> |:-----|:------|:--------|
> |openid  |string ||
> |country  |string ||
> |province  |string ||
> |city  |string ||


### feed
> 