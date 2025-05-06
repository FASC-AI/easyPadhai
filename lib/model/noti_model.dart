class NotifModel {
  int? code;
  bool? status;
  String? message;
  NData? data;

  NotifModel({this.code, this.status, this.message, this.data});

  NotifModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new NData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class NData {
  List<Notifications>? notifications;
  int? count;

  NData({this.notifications, this.count});

  NData.fromJson(Map<String, dynamic> json) {
    if (json['notifications'] != null) {
      notifications = <Notifications>[];
      json['notifications'].forEach((v) {
        notifications!.add(new Notifications.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.notifications != null) {
      data['notifications'] =
          this.notifications!.map((v) => v.toJson()).toList();
    }
    data['count'] = this.count;
    return data;
  }
}

class Notifications {
  String? sId;
  String? title;
  String? message;
  String? type;
  String? date;
  String? fromm;
  String? to;
  String? user;
  bool? isRead;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  Notifications(
      {this.sId,
      this.title,
      this.message,
      this.type,
      this.date,
      this.fromm,
      this.to,
      this.user,
      this.isRead,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV});

  Notifications.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    title = json['title'];
    message = json['message'];
    type = json['type'];
    date = json['date'];
    fromm = json['fromm'];
    to = json['to'];
    user = json['user'];
    isRead = json['isRead'];
    isActive = json['isActive'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['title'] = this.title;
    data['message'] = this.message;
    data['type'] = this.type;
    data['date'] = this.date;
    data['fromm'] = this.fromm;
    data['to'] = this.to;
    data['user'] = this.user;
    data['isRead'] = this.isRead;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    return data;
  }
}
