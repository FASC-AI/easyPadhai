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
    data = json['data'] != null ? new ProfileData.fromJson(json['data']) : null;
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

class ProfileData {
  UserDetails? userDetails;
  List<ClassDetail>? classDetail;
  List<SubjectDetail>? subjectDetail;
  List<SectionDetail>? sectionDetail;
  String? institute;
  String? picture;
  bool? class1;
  bool? section;
  bool? subject;
  bool? institutionRequired;
  bool? institution;

  ProfileData(
      {this.userDetails,
      this.classDetail,
      this.subjectDetail,
      this.sectionDetail,
      this.institute,
      this.picture,
      this.class1,
      this.section,
      this.subject,
      this.institutionRequired,
      this.institution});

  ProfileData.fromJson(Map<String, dynamic> json) {
    userDetails = json['userDetails'] != null
        ? new UserDetails.fromJson(json['userDetails'])
        : null;
    if (json['classDetail'] != null) {
      classDetail = <ClassDetail>[];
      json['classDetail'].forEach((v) {
        classDetail!.add(new ClassDetail.fromJson(v));
      });
    }
    if (json['subjectDetail'] != null) {
      subjectDetail = <SubjectDetail>[];
      json['subjectDetail'].forEach((v) {
        subjectDetail!.add(new SubjectDetail.fromJson(v));
      });
    }
    if (json['sectionDetail'] != null) {
      sectionDetail = <SectionDetail>[];
      json['sectionDetail'].forEach((v) {
        sectionDetail!.add(new SectionDetail.fromJson(v));
      });
    }
    institute = json['institute'];
    picture = json['picture'];
    class1 = json['class'];
    section = json['section'];
    subject = json['subject'];
    institutionRequired = json['institutionRequired'];
    institution = json['institution'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.userDetails != null) {
      data['userDetails'] = this.userDetails!.toJson();
    }
    if (this.classDetail != null) {
      data['classDetail'] = this.classDetail!.map((v) => v.toJson()).toList();
    }
    if (this.subjectDetail != null) {
      data['subjectDetail'] =
          this.subjectDetail!.map((v) => v.toJson()).toList();
    }
    if (this.sectionDetail != null) {
      data['sectionDetail'] =
          this.sectionDetail!.map((v) => v.toJson()).toList();
    }
    data['institute'] = this.institute;
    data['picture'] = this.picture;
    data['class'] = this.class1;
    data['section'] = this.section;
    data['subject'] = this.subject;
    data['institutionRequired'] = this.institutionRequired;
    data['institution'] = this.institution;
    return data;
  }
}

class UserDetails {
  String? name;
  String? email;
  String? mobile;
  String? role;

  UserDetails({this.name, this.email, this.mobile, this.role});

  UserDetails.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    email = json['email'];
    mobile = json['mobile'];
    role = json['role'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['name'] = this.name;
    data['email'] = this.email;
    data['mobile'] = this.mobile;
    data['role'] = this.role;
    return data;
  }
}

class ClassDetail {
  String? class1;
  String? sId;

  ClassDetail({this.class1, this.sId});

  ClassDetail.fromJson(Map<String, dynamic> json) {
    class1 = json['class'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['class'] = this.class1;
    data['_id'] = this.sId;
    return data;
  }
}

class SubjectDetail {
  String? subject;
  String? sId;

  SubjectDetail({this.subject, this.sId});

  SubjectDetail.fromJson(Map<String, dynamic> json) {
    subject = json['subject'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['subject'] = this.subject;
    data['_id'] = this.sId;
    return data;
  }
}

class SectionDetail {
  String? section;
  String? sId;

  SectionDetail({this.section, this.sId});

  SectionDetail.fromJson(Map<String, dynamic> json) {
    section = json['section'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['section'] = this.section;
    data['_id'] = this.sId;
    return data;
  }
}
