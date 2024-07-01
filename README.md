2024/07/01 使用snyk扫描项目漏洞 

测试环境
    web后端域名：https://dev-endpoint-ccb-itrmch.yunupay.com/
    页面访问域名：https://dev-ccb-itrmch.yunupay.com (用户名/密码 admin/admin123)  
    web部署位置：DEV >> taxrefundchinamgtpage 

    H5后端域名：https://dev-endpoint-portal-ccb-itrmch.yunupay.com
    页面访问域名：https://dev-portal-ccb-itrmch.yunupay.com/Passport?counterId=375391782508240896&pageType=1
			      https://dev-portal-ccb-itrmch.yunupay.com/?counterId=375391782508240896&stats=enable&scan=1
			      https://dev-portal-ccb-itrmch.yunupay.com/Position?partnerSourceId=1747549692910280704
    H5部署位置：CN-tax >> nanjingbank-taxrefundchinapage 
	
   地图导航访问域名：https://dev-portal-ccb-map.yunupay.com

南京环境
    web后端域名：https://endpoint-common-itrmch.yunupay.com/
    页面访问域名：https://common-itrmch.yunupay.com/ (用户名/密码 admin/yunupay)

    H5后端域名：https://endpoint-portal-common-itrmch.yunupay.com/
    页面访问域名：https://portal-common-itrmch.yunupay.com/Passport?counterId=365657277979500544&pageType=1

建行环境
    web后端域名：https://endpoint-ccb-itrmch.yunupay.com/
    页面访问域名：https://ccb-itrmch.yunupay.com/ (用户名/密码 ccb_manager/Ccb123456)

    H5后端域名：https://endpoint-portal-ccb-itrmch.yunupay.com/
    页面访问域名：https://portal-ccb-itrmch.yunupay.com/Passport?counterId=362005341174571008&pageType=1


发布前需要根据部署环境修改
  src\utils\Global.js 文件中 baseURL，需要将baseURL修改为部署环境的域名
  src\utils\RSA.js 文件中的加密字符串
  src\main.js 如果部署到生产环境，需要将Vconsole 组件禁用

自20240418次部署，已取消建行和南京环境，整体切换为通用环境，项目名称trspchina，后端请求地址为 https://endpoint-portal-common-itrmch.yunupay.com/（原南京生产环境后端请求地址）

20240529 为了方便每次部署，新增了public\entrypoint.sh文件，可以用来读取rancher环境变量，不用每次手动修改域名、加密字符串和vConsele组件是否使用
如果后期需要再新增rancher环境变量时，public\entrypoint.sh文件中需新增语句
20240529测试环境 新增nginx代理 (/prod-api 代理到 https://dev-endpoint-portal-ccb-itrmch.yunupay.com)
20240529UAT环境 新增nginx代理 (/prod-api 代理到 https://uat-endpoint-portal-ccb-itrmch.yunupay.com)
UAT环境与生产环境需要新增的rancher环境变量：
APP_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlUdZzBbfxO3a2/GrGpTUJl4yK1wSh+5bR0pt4UEQ4KmXWBCa3yhtado+yvUV5N4fwHEL+2eOrvegBVs6G5FUzKF1CUrfAaMBh0ICt1tXNQnS/OjaYPtefm/h3rzhfXRjIB2OHNYy/4OpWo8dc4XMMQZ1/SpKlHAjUBewoJR1V0zJJFxedjwzEGInttT5q+gYLqtUaDXga0P/8zOh+17iQuK8E9FjSHsu/fHsV9+nuOZXQZ/1WGM35MHekZVheTbNmmFuqHd+wIVAK0TitcBbUy0wrLdBIiQ9KUPs6kY/lQSVZrdzCmLXhxazbhQIs/EKMkRJtnP6gAg8lNbY+/Q7hwIDAQAB
APP_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVR1nMFt/E7drb8asalNQmXjIrXBKH7ltHSm3hQRDgqZdYEJrfKG1p2j7K9RXk3h/AcQv7Z46u96AFWzobkVTMoXUJSt8BowGHQgK3W1c1CdL86Npg+15+b+HevOF9dGMgHY4c1jL/g6lajx1zhcwxBnX9KkqUcCNQF7CglHVXTMkkXF52PDMQYie21Pmr6Bguq1RoNeBrQ//zM6H7XuJC4rwT0WNIey798exX36e45ldBn/VYYzfkwd6RlWF5Ns2aYW6od37AhUArROK1wFtTLTCst0EiJD0pQ+zqRj+VBJVmt3MKYteHFrNuFAiz8QoyREm2c/qACDyU1tj79DuHAgMBAAECggEABY9fx9s+QG5/jVul/Np4QGmXwseuJQP6wGAEUbSDtWp7qZsMua0ezieD2TlhtGGVmyxavuVvihLNEgYA1xAFsY1993ejcMMqhmguA7hSOjaAdk0R/TS/o0P1jL9KQsr3+jU/mtFbmurDfwz/ktLz9QuBj4lot7ipiA0p1gFRkYvLCXUWKNGrQE28LqPkbVEGxkJapVrep2AhVGYdlBp0gkCcJUnFjPQm7ZL+5WUcmbtn0YdmH5kV3W6fEDREsOs9X9x4z0GHR0hDj5F5w96UKzrlCdN1Zw4CJFDa703Iyi/w+g8TtAXVoVIqjBujV30EqAT4QVl+ViMu5r23gbxgsQKBgQDNgz6KHqhDxtWmLxQcOEtRsoWXbOVKRQqte7uJqQXsoWm2Jknv2INN3kWF+R4g/oZf/v3M1uIgiYxgxTRkMZyPSZZpYKd8yNyWR/UGy3XdVKklC+o+HLAQ8GVAxQMqk4pfIt4oCM86F+6fxG58tipQDKEfdY45nbm3DCskjpAoLwKBgQC584kNTJWAH2P5J0KxfLBgnw6s92FdmI90mbdxILzyM1dr4IiEPwXXFZ0J7ysH81JGPPKHawoCbo9RPqhrlq+AlgbVfGyijQyFaLWNiY9kHDBTtOJ8ujcdZph8GJoDfp8cXGJI5fAmswg1Z1igUuWmbTOMl8KnOnO/iaeWsz/0KQKBgEJrgYHoSJ+nGpPcMVaxhv4/gVegVTa8u6e4DrN+EjEZNe4tz8WZp046YSPckLU/LbTG18YlSO4VJm58LeOX+S6CLP+fwmHdFRXo6bMpfM1suEIF6M3sPacr2r2lLtHK33TB8yTjO/5dj7zJIqBhy6kVe9mMB8xtQoF7iFIHVWX3AoGAf32WuLSKR7a974RYeKH5t7U19acCbY58xL/jgr+kbBaBWKgwUSN4mJfr/HSrNx8/iIKe8fOUgEhXIKfqByHgIDQ8aUCOpwA31nwNBgaLdmLRS4LYShXOVe0SnPqtFbpJ0sMQa9Siy5WyChNaM0nCxFFYp4shXVB5LZhue6dYMMkCgYEAqAP/zKuIWFKCj1mXvhaNRrCpnYVbt+OvogpjgGQ+3GybpvIyqWPpHox9+s7P7paK1V5D4IYRVOLpRqvDJO8D7Womxvlu7J0C2hCMAEVUK/Nj4qYRSQ5pfrwsAfe5tq+BPUsRMgpj7vD01Kg2n6PFhUjcDEyOPRkXHqZ9pOIT2sI=
APP_SHOW_CONSOLE=false

南京生产环境历史版本
    
    原版本            hub.yunusas.com/pay-cntax-release-nanjingbank/taxrefundchinapage/pay-cntax-release-nanjingbank-taxrefundchinapage:0.3.0
    20240418部署版本  hub.yunusas.com/pay-cntax-release-nanjingbank/taxrefundchinapage/pay-cntax-release-nanjingbank-taxrefundchinapage:0.7.6
    20240514部署版本  hub.yunusas.com/pay-cntax-release-nanjingbank/taxrefundchinapage/pay-cntax-release-nanjingbank-taxrefundchinapage:0.8.1
    通用版本名称 trspchina


新增文本字符串
  请选择退税方式
  银行卡退税
  市区现金退税
  上传失败
  现金退税业务需要信用卡进行担保，请上传信用卡继续操作
  现金退税业务需要信用卡进行担保，请选择信用卡继续操作
  预计担保退税金（人民币）： 元
  确认担保

  操作提示
  确认担保后，将对您信用卡进行冻结人民币10000.00元，最长冻结90天。确定执行操作嘛？

  该卡可担保金额
  操作确认
  当前税单总退税额已经超过人民币10000.00元，根据规定仅能退款到银行卡。您是否确认？
  退款银行卡
  银行卡预授权失败，请更换信用卡
  将此码展示给市区退税柜台人员，领取现金
  撤销担保
  标题
  撤销担保后无法完成退税服务，是否继续？