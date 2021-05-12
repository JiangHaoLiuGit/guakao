// common/timer/timer.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    date: {            // 属性名
      type: null,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ""     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    tim:{
      type:String,
      value:""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pickerArray: [],//日期控件数据list
    pickerIndex: [],//日期控件选择的index
    chooseIndex: [],//日期控件确认选择的index
    chooseArray: [],//日期控件确认选择后的list
    dateString: '',//页面显示日期
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onInit() {
      if(this.data.date == ""){
        this.data.date = "2020-01-01"
      }
      let date = new Date();
      if (this.data.date != "") {
        let str = this.data.date;
        str = str.replace(/-/g, "/");
        date = new Date(str);
      }
      let pickerArray = this.data.pickerArray;
      //默认选择前10年内.后30年
      let year = [];
      // console.log("-----------")
      // console.log(this.data.tim)
      if(this.data.tim == "长期"){
        for (let i = date.getFullYear() + 1; i <= date.getFullYear() + 50; i++) {
          year.push({ id: i, name: i + "年" });
        }
      }else{
        for (let i = date.getFullYear() - 10; i <= date.getFullYear(); i++) {
          year.push({ id: i, name: i + "年" });
        }
      }
     
      
      // console.log(year);
      let month = [];
      for (let i = 1; i <= 12; i++) {
        month.push({ id: i, name: i + "月" });
      }
      // console.log(month);
      let dayNum = this._getNumOfDays(date.getFullYear(), date.getMonth() + 1);
      let day = [];
      for (let i = 1; i <= dayNum; i++) {
        day.push({ id: i, name: i + "日" });
      }
      // console.log(day);
      
      // console.log(division);
      pickerArray[0] = year;
      pickerArray[1] = month;
      pickerArray[2] = day;
      let mdate = {
        date: date,
        year: date.getFullYear() + '',
        month: date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1 + '',
        day: date.getDate() < 10 ? '0' + date.getDate() : date.getDate() + '',
      }
      mdate.dateString = mdate.year + '-' + mdate.month + '-' + mdate.day
      this.setData({
        pickerArray,
        pickerIndex: [1, date.getMonth(), date.getDate() - 1],
        chooseIndex: [1, date.getMonth(), date.getDate() - 1],
        chooseArray: pickerArray,
        dateString: mdate.dateString
      })
      // console.log(date);
      // this.triggerEvent('onPickerChange', mdate);
      // console.log(this.data.pickerArray);
      // console.log(this._getNumOfDays(2018, 10));
    },
    /**
     * 
     * 获取本月天数
     * @param {number} year 
     * @param {number} month 
     * @param {number} [day=0] 0为本月0最后一天的
     * @returns number 1-31
     */
    _getNumOfDays(year, month, day = 0) {
      return new Date(year, month, day).getDate()
    },
    pickerChange: function (e) {
      // console.log('picker发送选择改变，携带值为', e.detail.value)
      let indexArr = e.detail.value;
      // console.log(this.data.pickerArray[0][indexArr[0]].id + "\n" + this.data.pickerArray[1][indexArr[1]].id + "\n" + this.data.pickerArray[2][indexArr[2]].id);
      const year = this.data.pickerArray[0][indexArr[0]].id;
      const month = this.data.pickerArray[1][indexArr[1]].id;
      const day = this.data.pickerArray[2][indexArr[2]].id;
      let date = {
        date: new Date(year + '-' + month + '-' + day),
        year: year + '',
        month: month < 10 ? '0' + month : month + '',
        day: day < 10 ? '0' + day : day + '',
      }
      if(date.year == 100){
        date.dateString = "长期"
      }else{
        date.dateString = date.year + '-' + date.month + '-' + date.day;
      }
      
      console.log(date);
      this.setData({
        chooseIndex: e.detail.value,
        chooseArray: this.data.pickerArray,
        dateString: date.dateString
      })
      this.triggerEvent('onPickerChange', date);
    },
    pickerColumnChange: function (e) {
      var data = {
        pickerArray: this.data.pickerArray,
        pickerIndex: this.data.pickerIndex
      };
      console.log(data)
      data.pickerIndex[e.detail.column] = e.detail.value;
      if (e.detail.column == 1) {
        let dayNum = this._getNumOfDays(data.pickerArray[0][data.pickerIndex[0]].id, e.detail.value + 1);
        let day = [];
        for (let i = 1; i <= dayNum; i++) {
          day.push({ id: i, name: i + "日" });
        }
        if (dayNum < data.pickerIndex[2] + 1) {
          data.pickerIndex[2] = dayNum - 1;
        }
        data.pickerArray[2] = day;
      }
      this.setData(data);
    },
    pickerCancel: function (e) {
      // console.log("取消");
      this.setData({
        pickerIndex: this.data.chooseIndex,
        pickerArray: this.data.chooseArray
      })
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached() {
    // 在组件实例进入页面节点树时执行
    // 在组件实例进入页面节点树时执行
    // this._onInit();
  },
  ready() {
    console.log('进入ready外层节点=', this.data.date);
    this._onInit();
  },
  // 以下为新方法 >=2.2.3
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // this._onInit();
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
    ready() {
      this._onInit();
    }
  }
})