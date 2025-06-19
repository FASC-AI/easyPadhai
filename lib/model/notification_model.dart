class NotificationModel {
  int? code;
  bool? status;
  String? message;
  List<NData1>? data;

  NotificationModel({this.code, this.status, this.message, this.data});

  NotificationModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <NData1>[];
      json['data'].forEach((v) {
        data!.add(new NData1.fromJson(v));
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

class NData1 {
  List<String>? notificationIds;
  String? type;
  bool? isReaded;
  String? publishedDate;
  List<String>? subjectId;
  List<String>? classId;
  String? createdAt;
  String? updatedAt;
  List<Data1>? data;

  NData1(
      {this.notificationIds,
      this.type,
      this.isReaded,
      this.publishedDate,
      this.subjectId,
      this.classId,
      this.createdAt,
      this.updatedAt,
      this.data});

  NData1.fromJson(Map<String, dynamic> json) {
    notificationIds = json['notificationIds'].cast<String>();
    type = json['type'];
    isReaded = json['isReaded'];
    publishedDate = json['publishedDate'];
    subjectId = json['subjectId'].cast<String>();
    classId = json['classId'].cast<String>();
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    if (json['data'] != null) {
      data = <Data1>[];
      json['data'].forEach((v) {
        data!.add(new Data1.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['notificationIds'] = this.notificationIds;
    data['type'] = this.type;
    data['isReaded'] = this.isReaded;
    data['publishedDate'] = this.publishedDate;
    data['subjectId'] = this.subjectId;
    data['classId'] = this.classId;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Data1 {
  String? type;
  String? publishedDate;
  String? topic;

  Data1({this.type, this.publishedDate, this.topic});

  Data1.fromJson(Map<String, dynamic> json) {
    type = json['type'];
    publishedDate = json['publishedDate'];
    topic = json['topic'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['type'] = this.type;
    data['publishedDate'] = this.publishedDate;
    data['topic'] = this.topic;
    return data;
  }
}
