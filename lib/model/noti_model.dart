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
  List<String>? institution;
  String? sId;
  String? title;
  String? message;
  List<Type>? type;
  String? date;
  String? fromm;
  String? to;
  User? user;
  bool? isRead;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  Notifications(
      {this.sId,
      this.institution,
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
    if (json['institution'] != null) {
      institution = <String>[];
      json['institution'].forEach((v) {
        //  institution!.add(String.fromJson(v));
      });
    }
    if (json['type'] != null) {
      type = <Type>[];
      json['type'].forEach((v) {
        type!.add(new Type.fromJson(v));
      });
    }
    date = json['date'];
    fromm = json['fromm'];
    to = json['to'];
    user = json['user'] != null ? new User.fromJson(json['user']) : null;
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
    if (this.institution != null) {
      //data['institution'] = this.institution!.map((v) => v.toJson()).toList();
    }
    data['title'] = this.title;
    data['message'] = this.message;
    if (this.type != null) {
      data['type'] = this.type!.map((v) => v.toJson()).toList();
    }
    data['date'] = this.date;
    data['fromm'] = this.fromm;
    data['to'] = this.to;
    if (this.user != null) {
      data['user'] = this.user!.toJson();
    }
    data['isRead'] = this.isRead;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    return data;
  }
}

class User {
  Name? name;
  String? sId;
  String? email;
  String? id;

  User({this.name, this.sId, this.email, this.id});

  User.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    sId = json['_id'];
    email = json['email'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    data['_id'] = this.sId;
    data['email'] = this.email;
    data['id'] = this.id;
    return data;
  }
}

class Name {
  String? english;
  String? hindi;
  String? hinglish;

  Name({this.english, this.hindi, this.hinglish});

  Name.fromJson(Map<String, dynamic> json) {
    english = json['english'];
    hindi = json['hindi'];
    hinglish = json['hinglish'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['english'] = this.english;
    data['hindi'] = this.hindi;
    data['hinglish'] = this.hinglish;
    return data;
  }
}

class Type {
  String? sId;
  String? nameEn;

  Type({this.sId, this.nameEn});

  Type.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    return data;
  }
}
