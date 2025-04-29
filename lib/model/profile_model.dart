class ProfileModel {
  int? code;
  bool? status;
  String? message;
  ProfileData? data;

  ProfileModel({this.code, this.status, this.message, this.data});

  ProfileModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? ProfileData.fromJson(json['data']) : null;
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

class ProfileData {
  UserDetails? userDetails;
  String? picture;
  bool? classSet;
  bool? section;
  bool? subject;
  bool? institutionRequired;
  bool? institution;
  String? userRole;

  ProfileData({
    this.userDetails,
    this.picture,
    this.classSet,
    this.section,
    this.subject,
    this.institutionRequired,
    this.institution,
    this.userRole,
  });

  ProfileData.fromJson(Map<String, dynamic> json) {
    userDetails = json['userDetails'] != null
        ? UserDetails.fromJson(json['userDetails'])
        : null;
    picture = json['picture'];
    classSet = json['class'];
    section = json['section'];
    subject = json['subject'];
    institutionRequired = json['institutionRequired'];
    institution = json['institution'];
    userRole = json['userRole'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (userDetails != null) {
      data['userDetails'] = userDetails!.toJson();
    }
    data['picture'] = picture;
    data['class'] = classSet;
    data['section'] = section;
    data['subject'] = subject;
    data['institutionRequired'] = institutionRequired;
    data['institution'] = institution;
    data['userRole'] = userRole;
    return data;
  }
}

class UserDetails {
  String? name;
  String? email;

  UserDetails({this.name, this.email});

  UserDetails.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    email = json['email'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['name'] = name;
    data['email'] = email;
    return data;
  }
}
