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
  String? type;
  String? picture;
  String? address1;
  String? address2;
  String? pincode;
  bool? class1;
  bool? section;
  bool? subject;
  bool? institutionRequired;
  bool? institution;
  String? instituteId;
  String? instituteCode;
  State1? state;
  State1? district;

  ProfileData(
      {this.userDetails,
      this.classDetail,
      this.subjectDetail,
      this.sectionDetail,
      this.institute,
      this.type,
      this.picture,
      this.address1,
      this.address2,
      this.pincode,
      this.class1,
      this.section,
      this.subject,
      this.institutionRequired,
      this.institution,
      this.instituteId,
      this.instituteCode,
      this.state,
      this.district});

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
    type = json['type'];
    picture = json['picture'];
    address1 = json['address1'];
    address2 = json['address2'];
    pincode = json['pincode'];
    class1 = json['class'];
    section = json['section'];
    subject = json['subject'];
    institutionRequired = json['institutionRequired'];
    institution = json['institution'];
    instituteId = json['instituteId'];
    instituteCode = json['instituteCode'];
    state = json.containsKey('state') && json['state'] != null
        ? State1.fromJson(json['state'])
        : null;

    // Handle district - check if key exists and is non-null
    district = json.containsKey('district') && json['district'] != null
        ? State1.fromJson(json['district'])
        : null;
    // state = json['state'] != null ? new State1.fromJson(json['state']) : null;
    // district =
    //     json['district'] != null ? new State1.fromJson(json['district']) : null;
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
    // if (this.state != null) {
    //   data['state'] = this.state!.toJson();
    // }
    // if (this.district != null) {
    //   data['district'] = this.district!.toJson();
    // }
    if (state != null) {
      data['state'] = state!.toJson();
    }
    if (district != null) {
      data['district'] = district!.toJson();
    }
    data['institute'] = this.institute;
    data['instituteCode'] = this.instituteCode;
    data['type'] = this.type;
    data['picture'] = this.picture;
    data['address1'] = this.address1;
    data['address2'] = this.address2;
    data['pincode'] = this.pincode;
    data['class'] = this.class1;
    data['section'] = this.section;
    data['subject'] = this.subject;
    data['institutionRequired'] = this.institutionRequired;
    data['institution'] = this.institution;
    return data;
  }
}

class State1 {
  String? sId;
  Name? name;

  State1({this.sId, this.name});

  State1.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    return data;
  }
}

class Name {
  String? english;

  Name({this.english});

  Name.fromJson(Map<String, dynamic> json) {
    english = json['english'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['english'] = this.english;
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
  List<Images>? images;

  SubjectDetail({this.subject, this.sId, this.images});

  SubjectDetail.fromJson(Map<String, dynamic> json) {
    subject = json['subject'];
    sId = json['_id'];
    if (json['images'] != null) {
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['subject'] = this.subject;
    data['_id'] = this.sId;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Images {
  String? url;
  String? name;
  String? sId;

  Images({this.url, this.name, this.sId});

  Images.fromJson(Map<String, dynamic> json) {
    url = json['url'];
    name = json['name'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['url'] = this.url;
    data['name'] = this.name;
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
