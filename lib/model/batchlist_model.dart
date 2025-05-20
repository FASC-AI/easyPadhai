class BatchlistModel {
  int? code;
  bool? status;
  String? message;
  List<BbData>? data;

  BatchlistModel({this.code, this.status, this.message, this.data});

  BatchlistModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <BbData>[];
      json['data'].forEach((v) {
        data!.add(new BbData.fromJson(v));
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

class BbData {
  String? code;
  String? section;
  String? class1;
  String? classId;
  Subject? subject;
  String? institute;
  String? createdAt;
  bool? classTeacher;

  BbData(
      {this.code,
      this.section,
      this.class1,
      this.classId,
      this.subject,
      this.institute,
      this.createdAt,
      this.classTeacher});

  BbData.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    section = json['section'];
    class1 = json['class'];
    classId = json['classId'];
    subject =
        json['subject'] != null ? new Subject.fromJson(json['subject']) : null;
    institute = json['institute'];
    createdAt = json['createdAt'];
    classTeacher = json['classTeacher'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['section'] = this.section;
    data['class'] = this.class1;
    data['classId'] = this.classId;
    if (this.subject != null) {
      data['subject'] = this.subject!.toJson();
    }
    data['institute'] = this.institute!;

    data['createdAt'] = this.createdAt;
    data['classTeacher'] = this.classTeacher;
    return data;
  }
}

class Subject {
  String? sId;
  String? nameEn;
  String? codee;
  String? description;
  bool? isActive;
  List<Images>? images;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  Subject(
      {this.sId,
      this.nameEn,
      this.codee,
      this.description,
      this.isActive,
      this.images,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV});

  Subject.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    nameEn = json['nameEn'];
    codee = json['codee'];
    description = json['description'];
    isActive = json['isActive'];
    if (json['images'] != null) {
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['nameEn'] = this.nameEn;
    data['codee'] = this.codee;
    data['description'] = this.description;
    data['isActive'] = this.isActive;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
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
