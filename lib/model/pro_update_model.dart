class ProUpdateModel {
  int? code;
  bool? status;
  String? message;
  ProUpdateModelData? data;

  ProUpdateModel({this.code, this.status, this.message, this.data});

  ProUpdateModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null
        ? new ProUpdateModelData.fromJson(json['data'])
        : null;
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

class ProUpdateModelData {
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
  Address? address;

  ProUpdateModelData(
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
      this.address});

  ProUpdateModelData.fromJson(Map<String, dynamic> json) {
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
    address =
        json['address'] != null ? new Address.fromJson(json['address']) : null;
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
    if (this.address != null) {
      data['address'] = this.address!.toJson();
    }
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

class Address {
  String? address1;
  String? address2;
  String? pinCode;
  String? sId;
  District? district;
  District? state;

  Address(
      {this.address1,
      this.address2,
      this.pinCode,
      this.sId,
      this.district,
      this.state});

  Address.fromJson(Map<String, dynamic> json) {
    address1 = json['address1'];
    address2 = json['address2'];
    pinCode = json['pinCode'];
    sId = json['_id'];
    district = json['district'] != null
        ? new District.fromJson(json['district'])
        : null;
    state = json['state'] != null ? new District.fromJson(json['state']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['address1'] = this.address1;
    data['address2'] = this.address2;
    data['pinCode'] = this.pinCode;
    data['_id'] = this.sId;
    if (this.district != null) {
      data['district'] = this.district!.toJson();
    }
    if (this.state != null) {
      data['state'] = this.state!.toJson();
    }
    return data;
  }
}

class District {
  Name1? name;
  String? sId;
  String? id;

  District({this.name, this.sId, this.id});

  District.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name1.fromJson(json['name']) : null;
    sId = json['_id'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    data['_id'] = this.sId;
    data['id'] = this.id;
    return data;
  }
}

class Name1 {
  String? english;

  Name1({this.english});

  Name1.fromJson(Map<String, dynamic> json) {
    english = json['english'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['english'] = this.english;
    return data;
  }
}
