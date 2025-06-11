class NotiCount {
  int? code;
  bool? status;
  String? message;
  List<NotiCountData>? data;

  NotiCount({this.code, this.status, this.message, this.data});

  NotiCount.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <NotiCountData>[];
      json['data'].forEach((v) {
        data!.add(new NotiCountData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class NotiCountData {
  List<String>? notificationIds;
  String? type;
  bool? isReaded;
  bool? countRead;
  String? publishedDate;
  List<String>? subjectId;
  List<String>? classId;
  String? createdAt;
  String? updatedAt;
  //List<Data>? data;

  NotiCountData({
    this.notificationIds,
    this.type,
    this.isReaded,
    this.countRead,
    this.publishedDate,
    this.subjectId,
    this.classId,
    this.createdAt,
    this.updatedAt,
    //this.data
  });

  NotiCountData.fromJson(Map<String, dynamic> json) {
    notificationIds = json['notificationIds'].cast<String>();
    type = json['type'];
    isReaded = json['isReaded'];
    countRead = json['countRead'];
    publishedDate = json['publishedDate'];
    subjectId = json['subjectId'].cast<String>();
    classId = json['classId'].cast<String>();
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    // if (json['data'] != null) {
    //   data = <Data>[];
    //   json['data'].forEach((v) {
    //     data!.add(new Data.fromJson(v));
    //   });
    // }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['notificationIds'] = this.notificationIds;
    data['type'] = this.type;
    data['isReaded'] = this.isReaded;
    data['countRead'] = this.countRead;
    data['publishedDate'] = this.publishedDate;
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    // if (this.data != null) {
    //   data['data'] = this.data!.map((v) => v.toJson()).toList();
    // }
    return data;
  }
}
