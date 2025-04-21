class LoginModel {
  int? code;
  bool? status;
  String? message;
  LoginData? data;

  LoginModel({this.code, this.status, this.message, this.data});

  LoginModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? LoginData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['code'] = code;
    data['status'] = status;
    data['message'] = message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class LoginData {
  String? token;
  Name? name;
  String? id;
  String? userRole;
  IsProfileSet? isProfileSet;

  LoginData({this.token, this.name, this.id, this.userRole, this.isProfileSet});

  LoginData.fromJson(Map<String, dynamic> json) {
    token = json['token'];
    name = json['name'] != null ? Name.fromJson(json['name']) : null;
    id = json['id'];
    userRole = json['userRole'];
    isProfileSet = json['isProfileSet'] != null
        ? IsProfileSet.fromJson(json['isProfileSet'])
        : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['token'] = token;
    if (name != null) {
      data['name'] = name!.toJson();
    }
    data['id'] = id;
    data['userRole'] = userRole;
    if (isProfileSet != null) {
      data['isProfileSet'] = isProfileSet!.toJson();
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
    final Map<String, dynamic> data = <String, dynamic>{};
    data['hindi'] = hindi;
    data['hinglish'] = hinglish;
    data['english'] = english;
    return data;
  }
}

class IsProfileSet {
  bool? classSet;
  bool? section;
  bool? subject;
  bool? institution;

  IsProfileSet({this.classSet, this.section, this.subject, this.institution});

  IsProfileSet.fromJson(Map<String, dynamic> json) {
    classSet = json['class'];
    section = json['section'];
    subject = json['subject'];
    institution = json['institution'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['class'] = classSet;
    data['section'] = section;
    data['subject'] = subject;
    data['institution'] = institution;
    return data;
  }
}
