// pages/index/index.js
var ajax = require("../../../api/ajax.js")
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBtnHeight:"",
    userName:"张小雷",
    userImg:"/static/userImg.png",
    reView:[],
    listInfo:"加载中...",
    //去微信授权弹框显示状态
    point:false,
    //去分享弹框显示状态
    point2:false,
    //去分享驾驶员的弹框状态
    tapBlockBox:false,
    //生成的分享id
    firm_id:0,
    openId:""
  },
  //关闭分享弹窗
  callOff:function(){
    this.setData({
      point:false
    })
  },
  //关闭分享弹窗
  callOff2:function(){
    this.setData({
      point2:false
    })
  },
  shouquan:function(e){
    //用户授权
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo'] === true) { // 成功授权
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res)
              app.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)
              this.data.userImg = res.userInfo.avatarUrl
              this.setData({
                userImg:res.userInfo.avatarUrl,
                point:false
              })
            },
            fail: res => {
              console.log(res)
            }
          })
        } else if (res.authSetting['scope.userInfo'] === false) { // 授权弹窗被拒绝
          wx.openSetting({
            success: res => {
              console.log(res)
              console.log("用户拒绝了")
            },
            fail: res => {
              console.log(res)
            }
          })
        } else { // 没有弹出过授权弹窗
          wx.getUserInfo({
            success: res => {
              console.log(res)
              app.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)
              this.data.userImg = res.userInfo.avatarUrl
              this.setData({
                userImg:res.userInfo.avatarUrl,
                point:false
              })
            },
            fail: res => {
              console.log(res)
              wx.openSetting({
                success: res => {
                  console.log(res)
                  app.globalData.userInfo = res.userInfo
                  wx.setStorageSync('userInfo', res.userInfo)
                  this.setData({
                    userImg:res.userInfo.avatarUrl,
                    point:false
                  })
                },
                fail: res => {
                  console.log(res)
                }
              })
            }
          })
        }
      }
    })
  },
  go:function(e){
    let id = e.currentTarget.dataset.id
    
    wx.navigateTo({
      url: "/pages/firm/pending/pending?id="+id
    });
  },
  next:function(e){
    let index = e.currentTarget.dataset.index
    if(index == 0){
      
      this.setData({
        tapBlockBox:true
      })
    }else if(index == 1){
      wx.navigateTo({
        url: "/pages/firm/firmList/firmList?state="+1,
      });
    }else if(index == 2){
      wx.navigateTo({
        url: "/pages/firm/firmList/firmList?state="+0,
      });
    }
    
  },
  //去分享驾驶员推广码
  buttonSubmit2:function(e){
    if(e.detail.value.yanzhen != ""){
      let han = /^[\u4e00-\u9fa5]+$/;
      if(han.test(e.detail.value.yanzhen)){
        //去和后台进行交互生成推广码
        ajax.post(wx.getStorageSync("config").enterprise_url,{
          extensionUrl:"pages/firm/firmRegist/firmRegist",
          driverName:e.detail.value.yanzhen
        })
        .then(res => {
          console.log(res)
          wx.hideLoading()
          if(res.data > 0){
            //生成了企业注册id.准备去分享
            this.data.firm_id = res.data
            this.setData({
              firm_id:res.data,
              point2:true
            })
          }else{
            wx.showToast({ title: "该注册码已被分享,但未注册成功!", icon: "none",duration: 2000 });
          }
        }).catch(err => {
          //ajax.js反馈的reject结果
          console.log(err)
        })
      }else{
        wx.showToast({ title: "姓名只能为汉字", image:"/static/erreo.png",icon: "none",duration: 2000 });
      }
    }else{
      wx.showToast({ title: "姓名不能为空", image:"/static/erreo.png",icon: "none",duration: 2000 });
    }
  },
  //去分享驾驶员推广码
  tapBlock:function(e){
    let that = this
    this.setData({
      tapBlockBox:!that.tapBlock
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.zhi){
      console.log(options.zhi)
      // wx.showToast({title:"场景值:"+options.zhi,icon:'none',duration:2000})
    }
    if(app.globalData.userInfo){
      app.globalData.userInfo = wx.getStorageSync('userInfo')
    }
    if(app.globalData.userId && app.globalData.userId.openId){
      app.globalData.userId = wx.getStorageSync('userId')
    }
    if(app.globalData.navBtnHeight != "" && app.globalData.navTop != ""){
      this.setData({
        navBtnHeight:(app.globalData.navBtnHeight + app.globalData.navTop) *2 
      })
    }
    let userInfo = wx.getStorageSync('userInfo')
    let userInfoTwo = wx.getStorageSync('userInfoTwo')
    console.log(userInfoTwo)
    //如果没有userInfoTwo就显示微信授权的微信信息.
    if(userInfoTwo == "" || userInfoTwo == null || userInfoTwo){
      this.setData({
        userName : userInfoTwo.userNo,
        userImg : userInfo.avatarUrl
      })
    }
    if(this.data.userImg == "/static/userImg.png" || this.data.userImg == "" || this.data.userImg == undefined){
      this.setData({
        point:true
      })
    }
    
    this.data.openId = userInfoTwo.userNo
    
  },
  // 获取个人信息成功，然后处理剩下的业务或跳转首页
  setUserInfoAndNext(res) {
    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    // 所以此处加入 callback 以防止这种情况
    if (this.userInfoReadyCallback) {
      this.userInfoReadyCallback(res)
    }
    // 存数据
    console.log(res)
    
  },
  formatTimeTwo:function(value){
    let date = new Date(value);
    let y = date.getFullYear();
    let MM = date.getMonth() + 1;
    MM = MM < 10 ? ('0' + MM) : MM;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let m = date.getMinutes();
    m = m < 10 ? ('0' + m) : m;
    let s = date.getSeconds();
    s = s < 10 ? ('0' + s) : s;
    return y + '/' + MM + '/' + d
    // return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
  },
  formatTimeThree:function(value){
    let date = new Date(value);
    let y = date.getFullYear();
    let MM = date.getMonth() + 1;
    MM = MM < 10 ? ('0' + MM) : MM;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let m = date.getMinutes();
    m = m < 10 ? ('0' + m) : m;
    let s = date.getSeconds();
    s = s < 10 ? ('0' + s) : s;
    return y + '/' + MM + '/' + d + ' ' + h + ':' + m + ':' + s
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //wx.getStorageSync("frimId")
    ajax.get(wx.getStorageSync("config").company_url,{
    }).then(res => {
      console.log(res)
      if(res.code == 0){
        wx.setStorageSync('frimId', res.data.id)
      }
    }).catch(err => {
      //ajax.js反馈的reject结果
      console.log(err)
    })
    ajax.get(wx.getStorageSync("config").getCompanyList_url,{
      enterpriseId:wx.getStorageSync("frimId"),
      driverType:2,
      auditState:0,
      source:1,
      pageIndex:1,
      pageSize:20
    }).then(res => {
      console.log(res)
      let arr = res.data
      if(arr.length == 0){
        this.data.listInfo = "暂无数据"
        this.setData({
          listInfo:"暂无数据"
        })
      }
      for(let i = 0 ; i < arr.length ; i++){
        // arr[i].first = arr[i].abbreviation.substring(0,1)
        arr[i].updateDate = this.formatTimeTwo(arr[i].updateDate)
      }
      this.setData({
        reView:arr
      })
    }).catch(err => {
      //ajax.js反馈的reject结果
      console.log(err)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.setData({
      point2:false
    })
    //wx.getStorageSync("frimId")
    let firmId = this.data.firm_id
    let openId = this.data.openId
    console.log("tuiguang嘛")
    console.log(firmId)
    console.log("firm_id嘛")
    console.log(wx.getStorageSync("frimId"))
    this.data.firm_id = ""
    return {
      title: "驾驶员注册",
      desc:"马上去驾驶员注册",
      path:'/pages/firm/firmRegist/firmRegist?open=' + openId + "&&tuiguang=" + firmId + "&&firm_id=" + wx.getStorageSync("frimId")
    }
  }
})