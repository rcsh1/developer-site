# WaaS 2.0 OpenAPI 规范开发指南

此 README 描述 WaaS 2.0 如何使用 OpenAPI 规范添加、编辑或修改 API 描述的指导原则和最佳实践。希望大家都遵循这些规则。

## 文件结构

- 我们 API 描述的主要文件是 `main.yaml`。
- `components`、`paths` 等目录中的文件通过 `main.yaml` 使用 `$ref` 机制引用。
- 通过编辑 `main.yaml` 和 `components`、`paths` 等目录中的其他 YAML 文件来进行编辑和修改。

## 打包 OpenAPI 规范

编辑后，请使用以下命令打包规范：

待发布版本
```
$ swagger-cli bundle dev_main.yaml -o dev_openapi.yaml -t yaml
```

工作版本
```
$ swagger-cli bundle dev_main_working.yaml -o dev_openapi_working.yaml -t yaml
```

通过以下命令进行check：

```
$ swagger-cli validate dev_main.yaml
```

> **注意**：要运行 `swagger-cli` 命令，如果还没安装，使用以下命令：

```
$ npm install -g @apidevtools/swagger-cli
```

## 代码提交与测试

- 每次修改 API 规范时，确保运行上述命令生成新的 `openapi.yaml` 文件。
- 使用您熟悉的 API 设计/验证工具进行验证，如 Swagger UI、Postman 或 Insomnia。

## 规范指导原则

### 添加新的 API endpoints

- OpenAPI 规范的基本结构在 `main.yaml` 文件中已清晰定义。
- 要添加新的 API 描述，请添加至 `paths` 目录。可以编辑现有文件或为 api domain 创建新文件。

### API endpoint 和 operation 结构

- 一个 API endpoint 可以包含多个 operations（例如 `get`、`post`、`delete`）。
- 每个 operation 都应具有 `summary`、`description`、`operationId` 和 `tags` 等必填字段。

以下是一个示例：

```
/wallets:
  get:
    summary: Get all Wallets
    description: |
Gets information about all wallets the current can access.
**Note:**
This api can be used with filters and paginations
    operationId: get_wallets
    tags:
      - wallets
      - v2
    responses:
      "200":
        $ref: "../components/responses/wallets/get_wallets.yaml"
      "401":
        $ref: "../components/responses/unauthorized.yaml"
      "404":
        $ref: "../components/responses/api_not_found_error.yaml"
      "422":
        $ref: "../components/responses/v2_unsupported.yaml"
      "500":
        $ref: "../components/responses/server_error.yaml"
    parameters:
          - $ref: "../components/parameters/limit_param.yaml"
          - $ref: "../components/parameters/offset_param.yaml"
          - $ref: "../components/parameters/wallets/filter_by_type.yaml"
```

## 认证和授权

- Cobo WaaS 2.0 可以支持以下三种认证和授权的方式：

  - **CookieAuth**: 采用 `Cobo Accounts SSO` 登录的应用, 如 `Cobo Custody` 和 `Cobo Argus`，用户登录后将会获得 '\*.cobo.com'域名下的 session cookie，该 cookie 可以用于认证和授权登录用户。
  - **CoboAuth**: 采用 Cobo 定制的 ECDSA/EDDSA 的 `api-key` 和 `api-secret` 的认证和授权。主要应用外部程序或者应用直接通过 API 操作客户钱包的应用场景，交易所等 B2B2C 是典型代表。
  - **OAuth2**：采用 OAuth2.0 协议的 Authorization code flow 的认证授权机制。主要应用在第三方授权工具、应用和机器人在机构授权范围内进行操作的应用场景，如小工具，抢跑机器人等。

- 目前所有的 API endpoint 默认都支持 `CookieAuth` 或者 `CoboAuth`。这个是通过以下全局`security`声明生效的。

```
security:
  - CoboAuth: []
    CoboSignature: []
    CoboNonce: []
  - CookieAuth: []
```

以上定义说明:

- `CoboAuth`，客户端必须要传 4 个 HTTP HEADER, 分别是 `BIZ-API-KEY`, `BIZ-API-SIGNATURE`, `BIZ-API-NONCE`以及`BIZ-ORG-ID`，注意:`BIZ-ORG-ID`是为了表示当前的 api 调用作用于哪个 org，避免一些 api endpoints 重复的 encode 在路径`path`里面，简化`path`设计。
- `CookieAuth`需要传入`sessionId` cookie 以及`BIZ-ORG-ID` HTTP header，分别表明当前的用户和机构 OrgID。

> 注意: 即便客户端传过来 Org ID, WaaS 2.0 的 api endpoints 也需要验证当前用户是否属于该机构，并且根据该用户在机构内的角色（如 admin, spender, viewer 等）检查确保该用户属于机构并且拥有必要的权限，才能放行。

与`CoboAuth`和`CookieAuth`不同的是，`OAuth2`是通过 `access_token` 来调用 WaaS 2.0 的 api。通常第三方的工具或者程序通过 OAuth2.0 的 authentication code flow 获得（详见 {T55898})， 并且在调用 WaaS 2.0 的时候传入获得的 `access_token`。因此，如果一个 api operation 需要支持第三方工具访问，则需要在该 api operation 的 `security` 字段里面声明 `access_token` 所具有的权限(scope)，才能放行。比如，下面的例子表明如果第三方工具代表用户来更新钱包，其 `access_token` 必须包含`wallets:write`或者`admin`的权限（scope)：

```
put:
  tags:
    - Wallets
  operationId: update_wallet_by_id
  summary: Update wallet by ID
  description: More detailed description on updating wallet info by ID
  security:
    - OAuth2:
      - wallets:write
      - admin
    - CoboAuth: []
      CoboSignature: []
      CoboNonce: []
    - CookieAuth: []
  requestBody:
    description: The request body to update a wallet
    content:
      application/json:
        schema:
          $ref: '../components/schemas/wallets/wallet.yaml'
  responses:
    '200':
      $ref: "../components/responses/wallets/update_wallet.yaml"
```

> 注意, OpenAPI spec 里面，一个 api operation 如果定义了`security`字段，它将覆盖全局的`security`定义。因此，如果该 api operation 如果想在全局的 `security` 基础上添加的 OAuth2 的支持，也必须重复再次声明已经定义的'CoboAuth', 'CookieAuth'。

如果你想某个 api 不用做认证，可以直接 `security: []`

```
paths:
  /public_endpoint:
    get:
      summary: Retrieve public data
      description: An example API endpoint that does not require any authentication or authorization.
      security: []
      responses:
        "200":
          description: Request was successful
```

## Request 格式

- 建议在 components/request_bodies 中为每个请求体定义内容。在特定情况下，也可以在 API 操作中直接 inline 定义。下面举例如何定义 request body:

### 定义 Request Body 格式

首先，定义请求体的格式。通常，这在一个独立的文件中完成，例如 `create_wallet.yaml`：

```
description: The request body to create a wallet
content:
  application/json:
    schema:
      type: object
      properties:
        name:
          type: string
```

### 添加到 API Endpoint 描述

要在 API endpoint 描述中使用此请求体，使用 `$ref` 引用此文件。例如，在 `wallets.yaml` 中的 POST 操作：

```
/wallets:
  post:
    tags:
      - Wallets
    operationId: create_wallet
    summary: Create a new wallet
    description: ..More detailed explanation on creating a new wallet..
    requestBody:
      $ref: "../components/request_bodies/create_wallet.yaml"
```

### 在 `main.yaml` 中添加相应的定义

为了让 `create_wallet.yaml` 文件在最终生成的 `openapi.yaml` 文件中生效，在 `main.yaml` 的 `requestBodies` 部分引用它：

```
requestBodies:
  createWalletBody:
    $ref: "./components/request_bodies/create_wallet.yaml"

```

### 最后在生成的`openapi.yaml` 文件中的效果

```
/wallets:
  post:
    tags:
      - Wallets
    operationId: create_wallet
    summary: Create a new wallet
    description: ..More detailed explanation on creating a new wallet..
    requestBody:
      $ref: '#/components/requestBodies/createWalletBody'
```

## Api Response 和 Error Response

- 建议在 components/responses 中为每个响应定义内容。在特定情况下，也可以在 API 操作中直接 inline 定义。

### 定义 API Response (api_response.yaml)

```
type: object
properties:
  success:
    type: boolean
    description: Indicates if the api operation was successful
  result:
    type: object
    description: Contains the actual response data
```

这描述了一个成功的 API 响应，其中包括一个布尔值字段`success`和一个包含实际响应数据的`result`字段。

### 自定义 API Response 的结构

每个 api endpoint 可以回复自己的 response 格式，这个是通过扩展 api_response.yaml 来实现的。比如：`get_a_wallet.yaml`里面定义

```
description: Successful operation
content:
  application/json:
    schema:
      allOf:
        - $ref: '../schemas/api_response.yaml'
        - type: object
          properties:
            result:
              $ref: '../schemas/wallets/wallet.yaml'
```

### 错误 response (error_response.yaml)

```
type: object
required:
  - success
  - error_code
  - error_description
  - error_id
properties:
  success:
    type: boolean
    description: Indicates if the API operation was successful. Always false for errors.
  error_code:
    type: string
    description: A machine-readable error code.
  error_description:
    type: string
    description: A human-readable error description for users.
  error_id:
    type: string
    description: A unique ID for the error log, mainly used for debugging.

```

### 扩展和自定义错误 response

比如下面的文件 '404_not_found.yaml'是这样定义的

```
description: Resource Not Found
content:
  application/json:
    schema:
      $ref: "../../schemas/error_response.yaml"
```

### 将 response 添加到 `main.yaml`

```
responses:
  getWalletByIdApi:
    $ref: "./components/responses/wallets/get_a_wallet.yaml"
  notFoundError:
    $ref: "./components/responses/errors/404_not_found.yaml"
```

### 引用自定义 response

```
/wallets/{wallet_id}:
  parameters:
    - $ref: "../components/parameters/wallets/wallet_id_param.yaml"
  get:
    tags:
      - Wallets
    operationId: get_wallet_by_id
    summary: get information for a particular wallet
    description: Detailed description on retrieving wallet information by id
    responses:
      '200':
        $ref: "../components/responses/wallets/get_a_wallet.yaml"
      '404':
        $ref: "../components/responses/errors/404_not_found.yaml"

```

## 参数处理

### 参数定义

每个参数都应该在`components/parameters`目录下有一个对应的定义文件。这样做的好处是可以重复使用，并保持 API 描述的清晰性。以`wallet_id_param.yaml`为例：

```
name: wallet_id
in: path
required: true
description: ID of the wallet to update
schema:
  type: string
```

这里，参数被命名为`wallet_id`，它出现在路径中（因此`in: path`），并且是必需的。描述和模式进一步明确了它的用途和预期格式。

### 使用参数

如果一个参数仅在一个 API endpoint 中使用，可以直接在该 endpoint 描述中通过`$ref`引用它：

```
/wallets/{wallet_id}:
  parameters:
    - $ref: "../components/parameters/wallets/wallet_id_param.yaml"
```

在最终生成的 OpenAPI 规范中，如果不在`main.yaml`中进行特别声明，这个参数会被自动内联, 如：

```
  '/wallets/{wallet_id}':
    parameters:
      - name: wallet_id
        in: path
        required: true
        description: ID of the wallet to update
        schema:
          type: string
```

### 重复使用的参数

对于可能在多个地方使用的参数，建议在`main.yaml`的`components`部分进行集中声明：

```
components:
  parameters:
    walletIdParam:
      $ref: "./components/parameters/wallets/wallet_id_param.yaml"
```

这样，当该参数在多个 endpoints 中被使用时，只需引用`main.yaml`中的声明，而不是单独的文件。在最终生成的 OpenAPI 规范中，这会产生一个对中心`components/parameters`部分的引用，保持了规范的整洁性。

### 常见参数

对于被许多 API 频繁使用的常见参数（如分页参数），建议始终在`main.yaml`中声明它们，如：

```
  parameters:
    limitParam:
      $ref: "./components/parameters/limit_param.yaml"
    offsetParam:
      $ref: "./components/parameters/offset_param.yaml"
    filterByType:
      $ref: "./components/parameters/wallets/filter_by_type.yaml"

```

## 分页 Pagination 处理

分页（pagination）在 RESTful API 设计中是一种常见的模式，用于处理大量数据的场景，确保数据以可管理的块返回。

### 定义分页元数据结构：

首先，在`components/schemas/pagination_metadata.yaml`中定义了分页元数据的结构：

```
type: object
properties:
  total_records:
    type: integer
    format: int32
  total_pages:
    type: integer
    format: int32
  current_page:
    type: integer
    format: int32
  page_size:
    type: integer
    format: int32
```

这个结构提供了分页的基本信息，包括：总记录数、总页数、当前页和每页的记录数。

### 在 main.yaml 文件中引入：

在`main.yaml`中，引用了上述的分页元数据结构，确保它在其他地方被复用：

```
components:
  schemas:
    PaginationMetadata:
      $ref: "./components/schemas/pagination_metadata.yaml"
```

### 在 API endpoint 中使用分页：

接下来，在想要支持分页的 API endpoint 中，添加与分页相关的参数。例如，在`/wallets` endpoint：

```
parameters:
  - $ref: "../components/parameters/limit_param.yaml"
  - $ref: "../components/parameters/offset_param.yaml"
  - $ref: "../components/parameters/wallets/filter_by_type.yaml"
```

### 扩展 API Response 添加分页支持：

```
description: Successful listed wallets
content:
  application/json:
    schema:
      allOf:
        - $ref: '../schemas/api_response.yaml'
        - type: object
          properties:
            result:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '../schemas/wallets/wallet.yaml'
                pagination:
                  $ref: '../schemas/pagination_metadata.yaml'
```

当客户端请求`/wallets` endpoint 并使用分页参数时，返回的 JSON 结构会包含如下内容：

```
{
  "success": true,
  "result":
    {
       "data": [.. wallets ..],
       "pagination": {
           "total_records": ..,
           "total_pages": ..,
           "current_page": ..,
           "page_size": ..
       }
    }
}
```

## 提供 example

当开发人员为 API 编写 OpenAPI 规范时，提供详尽的例子和格式化信息可以为 API 的用户（如前端开发人员、测试人员、其他后端开发人员等）提供更清晰、易于理解的指导。这也有助于确保 API 文档是一个实用、动态的资源，可以方便地被用来测试和验证 API 的行为。

### 要求描述

1. **详细的例子**：为参数、响应和属性提供实际的例子，以便用户能够更容易地了解它们的期望格式和用法。
2. **格式化信息**：除了提供数据类型（如 string、integer 等）外，还要提供更具体的格式化信息。例如，日期可能是一个字符串，但是具体的格式可能是日期（'yyyy-mm-dd'）或日期时间（'yyyy-mm-ddTHH:mm:ssZ'）。
3. **结合实际例子**：在规范中提供实际的例子，以展示如何使用参数、响应和属性。

### 举例

- **参数的例子**

```
name: startDate
in: query
description: The start date for filtering results.
required: true
schema:
  type: string
  format: date
  example: '2023-01-01'
```

这里除了`type`为`string`之外，我们还定义了`format`为`date`，并且给了一个具体的`example`。

- **Response 的例子**

```
User:
  type: object
  properties:
    id:
      type: integer
      format: int64
      example: 12345
    name:
      type: string
      example: 'John Doe'
    email:
      type: string
      format: email
      example: 'john.doe@example.com'
    dateOfBirth:
      type: string
      format: date
      example: '1990-01-01'
```

在这个例子中，每个属性都有`type`、`format`和`example`。这样，用户可以很容易地理解每个属性的预期格式和值。

- **property 的例子**：

```
amount:
  type: number
  format: float
  example: 123.45
```

这里，`type`是`number`，`format`是`float`，并且还给出了一个具体的`example`。

### WaaS 2.0 的 resource Id 使用 uuid

为了提高 API 的安全性和隐私保护，我们要求在访问 API 时使用 UUID 作为资源标识符，而不是使用数字类型（例如 808951）。

**为什么使用 UUID**?

- 随机性和不可预测性：UUID（通用唯一标识符）是一种具有高度随机性和不可预测性的字符串标识符。这使得攻击者难以猜测或推测资源 ID，从而增加了安全性。
- 隐私保护：使用 UUID 可以有效保护用户的隐私。数字类型的 ID 可能会泄露有关资源创建顺序或数量的信息，而 UUID 不会。
- 安全性：数字 ID 可能会导致安全漏洞，例如暴露数据库中的自增主键。使用 UUID 可以降低这些风险。
- 一致性：使用 UUID 有助于保持 API 资源 ID 的一致性。不同资源和端点之间的 ID 具有相同的格式，使 API 更易于使用和理解。

### 使用`expand`参数扩展 API Response 中资源

支持 `expand` 参数的 API 设计能极大提升 API 的灵活性和效率。通过 `expand` 参数，
用户能够在一个请求中获得关联对象的详细信息，而无需进行额外的 API 调用。这样不仅
可以减少网络延迟，提高响应速度，也让 API 的使用变得更为直观和便捷。此外，`expand`
参数还支持递归展开和多对象同时展开，进一步增加了 API 的灵活性，使其能满足各种复杂
和动态的信息检索需求。

在`components/parameters/expand_param.yaml`定义了`expand`参数, 如下：

```
name: expand
in: query
description: Allows clients to expand the returned object embedded in another object
required: false
style: form
explode: true
schema:
  type: array
  items:
    type: string
```

以及`main.yaml`中定义了：

```
  parameters:
    expandParam:
      $ref: "./components/parameters/expand_param.yaml"
```

这里定义了一个名为 `expand` 的查询参数，它期望一个字符串数组。这样，如果你的`GET`操作中
就可以直接添加`expand`参数：

```
paths:
  /somePath:
    get:
      summary: Retrieves something
      parameters:
        - $ref: '#/components/parameters/expand_param.yaml'
      responses:
        '200':
          description: Successful response

```

客户端可以使用 /somePath?expand=wallet&expand=member.role
来请求展开的对象。请确保你的 API 的实现能够正确处理这个参数，并根据请求返回展开的对象。

### 附录说明

#### 幂等请求(Idempotent Request)

在执行网络请求（尤其是金融交易和其他关键操作）时，因网络不稳定、请求超时等因素可能导致请求失败。在这种情况下，通常需要重新发起请求。然而，这带来了一个问题：如何确保重复的请求不会导致服务器执行重复的操作，保证数据的一致性和业务逻辑的准确性。

幂等性成为解决此问题的关键。它的思路是通过在客户端生成一个唯一的幂等性键（Idempotency-Key），并将其通过 HTTP Header 作为请求的一部分发送到服务器，我们可以确保即使请求被重复发送，相应的操作也只会被执行一次。服务器将基于该幂等性键来识别和过滤重复的请求。

##### 具体方案

- 客户端生成 Idempotency-Key

客户端在发起需要保证幂等性的请求时生成一个唯一的 Idempotency-Key。这可以通过 UUID v4 或其他随机字符串生成算法实现。

- 将 Idempotency-Key 附加到 HTTP Header

客户端将生成的 Idempotency-Key 作为 HTTP Header 的一部分发送到服务器。例如：

```
POST /wallets/{wallet_id}/transfer HTTP/1.1
Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000
...
```

- 服务器处理
  服务器在接收到带有 Idempotency-Key 的请求后进行以下操作：
  - 检查幂等性键是否已存在。如果存在并且请求已成功处理，直接返回先前操作的结果，不执行操作。
  - 如果幂等性键不存在，则处理请求，并将幂等性键与操作结果一起存储。
  - 幂等性键应在一定时间后（例如 24 小时）自动过期，以减轻存储负担。

这种机制确保了网络不稳定环境下操作的一致性和完整性，避免了数据错误和重复操作。

**所有的 POST 请求都应该发送幂等性键**。在 GET 和 DELETE 请求中发送幂等性键是没有效果的，应该避免，因为根据定义，这些请求本身就是幂等的。

参见 Strip 的[idempotent_requests](https://stripe.com/docs/api/idempotent_requests), [error_handling](https://stripe.com/docs/error-low-level#idempotency)

#### Webhook 事件订阅
- 事件定义
  总的来说，事件由`资源类型`和`事件类型`定义。`资源类型`往往是一个领域(`domain`)下的资源（可以是多层，比如: `wallet`, `wallet.mpc`, `wallet.mpc.tss_node`等。`事件类型`往往是一个动作的结果，但是这又分成两种情况：
  - **同步动作**：立刻可以完成的动作，如添加，删除，更新等。
  - **异步动作**：需要经过状态转换，多步骤才能完成，比如交易上链确认。
  因此`事件类型`, 对应也有两种情况，同步动作，直接用该动作的过去式(past tense)来表达，比如: `added`, `updated`, `created`, `deleted`等，而异步动作则由状态推进中的状态来表达，比如: `submitted`, `pending_approval`, `pending`, `approved`, `confirmed`等。 以下是在Cobo Portal中的一些Webhook的事件的例子：
  - wallet.created
  - wallet.mpc.tss_node.created
  - transaction.inbound.submitted
  - transaction.outbound.confirmed
  - wallet.transfer.created
  - wallet.transfer.pending_approval
  - wallet.transfer.confirmed
  - wallet.smart_contract_call.canceled
  - wallet.smart_contract_call.rbf

- 事件注册
  事件注册是指Cobo Portal中需要定义出所有支持的事件, `webhook` app 在启动的时候会把事件注册到 webhook service中。所有的的事件都被定义在 `91_webhook.py` 的 WEBHOOK_EVENT_DEFINITIONS 中, 其中：
  - `event_type`: 事件定义的唯一标识，应该按照按照上述  `事件定义` 部分的规范去定义。
  - `description`: 应该准确的描述事件在什么情况下会被触发。

- 事件的订阅
  事件的订阅由用户发起, `webhook` app 对外暴露了一组webhook api, Cobo Portal 的用户可以调用 api 或者通过开发中心web端 进行事件的订阅, endpoint 的管理, 触发日志查询的操作, 详见api spec。 webhook service 会维护Cobo Portal 中客户的endpoints 和事件的订阅关系。

- 事件触发
  事件触发由Cobo portal 系统发起, `webhook` app 封装了触发事件的接口 `WebhookEventManager.create_events`, 在Portal 的业务代码中, 根据事件的定义, 在合适的位置调用此方法触发webhook 事件。


