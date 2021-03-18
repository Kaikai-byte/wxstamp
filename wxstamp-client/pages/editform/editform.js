var app = getApp();

Component({
  data: {
      isSaved:false,
      reasonOfRequest:"",
      sealIndex: 0,
      
      showTopTips: false,

      date: "2021-02-18",
      formData: {
      },
      sealArray: app.globalData.sealArray,
      sealUseRequestFormDraftToBeEdited: {},
      status:"草稿"
  },
  methods: {
      onLoad: function () {
        var selectedRequestID = app.globalData.selectedRequestID;
        if (selectedRequestID){
            var sealUseRequestFormDraft = wx.getStorageSync('sealUseRequestFormDraft');
            for(var i in sealUseRequestFormDraft){
                if (sealUseRequestFormDraft[i].requestID == selectedRequestID){
                    this.setData({sealUseRequestFormDraftToBeEdited:sealUseRequestFormDraft[i],
                        date: sealUseRequestFormDraft[i].requestDate,
                        sealIndex:sealUseRequestFormDraft[i].sealIndex,
                        reasonOfRequest:sealUseRequestFormDraft[i].reasonOfRequest}
                        )
                }
            }
        }
      },
      sealChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            sealIndex: e.detail.value
        })
      },
      textInput:function(e){
          this.data.reasonOfRequest = e.detail.value;
        //  console.log(this.data.reasonOfRequest);
      },

      saveNewForm:function(){
        var myDate = new Date();
        var requestID = myDate.getTime();
        this.data.isSaved = true;
        var sealUseRequestFormDraft = wx.getStorageSync('sealUseRequestFormDraft')|| [];
        console.log(sealUseRequestFormDraft);
        var newSealUseRequestFormDraft = {
          requestID : requestID,
          requestDate : this.data.date,  
          sealIndex : this.data.sealIndex,
          reasonOfRequest : this.data.reasonOfRequest,
          status: "草稿"
        };
        sealUseRequestFormDraft.push(newSealUseRequestFormDraft);
        wx.setStorageSync('sealUseRequestFormDraft', sealUseRequestFormDraft);
        wx.showToast({title:"已保存", duration: 600});
      },
    
      saveEditedForm:function(requestID){
        var myDate = new Date();
        this.data.isSaved = true;
        var sealUseRequestFormDraft = wx.getStorageSync('sealUseRequestFormDraft');
        for(var i in sealUseRequestFormDraft){
            if (sealUseRequestFormDraft[i].requestID == requestID){
              sealUseRequestFormDraft[i]={
                requestID : requestID,
                requestDate : this.data.date,  
                sealIndex : this.data.sealIndex,
                reasonOfRequest : this.data.reasonOfRequest,
              };
            };    
        }
        wx.setStorageSync('sealUseRequestFormDraft', sealUseRequestFormDraft);
        wx.showToast({title:"已编辑", duration: 600});
      },


      saveForm:function(e){
        if (JSON.stringify(this.data.sealUseRequestFormDraftToBeEdited)=="{}"){
            this.saveNewForm();
        }
        else{
            this.saveEditedForm(this.data.sealUseRequestFormDraftToBeEdited.requestID)
        }
       
      },

      bindDateChange: function (e) {
          this.setData({
              date: e.detail.value,
              [`formData.date`]: e.detail.value
          })
      },
      formInputChange(e) {
          const {field} = e.currentTarget.dataset
          this.setData({
              [`formData.${field}`]: e.detail.value
          })
      },
  }
});
