class Joinedmodel {
  int? code;
  bool? status;
  String? message;
  List<JoinedData>? data;

  Joinedmodel({this.code, this.status, this.message, this.data});

  Joinedmodel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <JoinedData>[];
      json['data'].forEach((v) {
        data!.add(new JoinedData.fromJson(v));
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

class JoinedData {
  String? sId;
  UserId? userId;
  String? batchId;
  bool? approve;
  String? createdAt;
  String? updatedAt;
  int? iV;

  JoinedData(
      {this.sId,
      this.userId,
      this.batchId,
      this.approve,
      this.createdAt,
      this.updatedAt,
      this.iV});

  JoinedData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    userId =
        json['userId'] != null ? new UserId.fromJson(json['userId']) : null;
    batchId = json['batchId'];
    approve = json['approve'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    if (this.userId != null) {
      data['userId'] = this.userId!.toJson();
    }
    if (this.batchId != null) {
      data['batchId'] = this.batchId;
    }
    data['approve'] = this.approve;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

class UserId {
  Name? name;
  LastLogin? lastLogin;
  String? sId;
  String? email;
  bool? isActive;
  String? activeSessionId;
  bool? deleted;
  String? loginMethod;
  List<Null>? passwordHistory;
  String? googleId;
  bool? emailVerified;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? password;
  String? token;
  String? userRole;
  String? mobile;
  String? picture;
  String? subject;
  String? subjectId;

  UserId(
      {this.name,
      this.lastLogin,
      this.sId,
      this.email,
      this.isActive,
      this.activeSessionId,
      this.deleted,
      this.loginMethod,
      this.passwordHistory,
      this.googleId,
      this.emailVerified,
      this.createdAt,
      this.updatedAt,
      this.iV,
      this.password,
      this.token,
      this.userRole,
      this.mobile,
      this.picture,
      this.subject,
      this.subjectId});

  UserId.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    lastLogin = json['lastLogin'] != null
        ? new LastLogin.fromJson(json['lastLogin'])
        : null;
    sId = json['_id'];
    email = json['email'];
    isActive = json['isActive'];
    activeSessionId = json['activeSessionId'];
    deleted = json['deleted'];
    loginMethod = json['loginMethod'];
    // if (json['passwordHistory'] != null) {
    //   passwordHistory = <Null>[];
    //   json['passwordHistory'].forEach((v) {
    //     passwordHistory!.add(new Null.fromJson(v));
    //   });
    // }
    googleId = json['googleId'];
    emailVerified = json['emailVerified'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    password = json['password'];
    token = json['token'];
    userRole = json['userRole'];
    mobile = json['mobile'];
    picture = json['picture'];
    subject = json['subject'];
    subjectId = json['subjectId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    if (this.lastLogin != null) {
      data['lastLogin'] = this.lastLogin!.toJson();
    }
    data['_id'] = this.sId;
    data['email'] = this.email;
    data['isActive'] = this.isActive;
    data['activeSessionId'] = this.activeSessionId;
    data['deleted'] = this.deleted;
    data['loginMethod'] = this.loginMethod;
    // if (this.passwordHistory != null) {
    //   data['passwordHistory'] =
    //       this.passwordHistory!.map((v) => v.toJson()).toList();
    // }
    data['googleId'] = this.googleId;
    data['emailVerified'] = this.emailVerified;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    data['password'] = this.password;
    data['token'] = this.token;
    data['userRole'] = this.userRole;
    data['mobile'] = this.mobile;
    data['picture'] = this.picture;
    data['subject'] = this.subject;
    data['subjectId'] = this.subjectId;
    return data;
  }
}

class Name {
  String? hindi;
  String? hinglish;
  String? english;

  Name({this.hindi, this.hinglish, this.english});

  Name.fromJson(Map<String, dynamic> json) {
    hindi = json['hindi'];
    hinglish = json['hinglish'];
    english = json['english'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['hindi'] = this.hindi;
    data['hinglish'] = this.hinglish;
    data['english'] = this.english;
    return data;
  }
}

class LastLogin {
  String? date;
  String? ip;

  LastLogin({this.date, this.ip});

  LastLogin.fromJson(Map<String, dynamic> json) {
    date = json['date'];
    ip = json['ip'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['date'] = this.date;
    data['ip'] = this.ip;
    return data;
  }
}
