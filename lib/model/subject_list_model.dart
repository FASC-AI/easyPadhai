class SubjectListModel {
  int? code;
  bool? status;
  String? message;
  SubjectData? data;

  SubjectListModel({this.code, this.status, this.message, this.data});

  SubjectListModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? SubjectData.fromJson(json['data']) : null;
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

class SubjectData {
  List<SubjectList>? subject;
  int? count;

  SubjectData({this.subject, this.count});

  SubjectData.fromJson(Map<String, dynamic> json) {
    if (json['subject'] != null) {
      subject = <SubjectList>[];
      json['subject'].forEach((v) {
        subject!.add(SubjectList.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (subject != null) {
      data['subject'] = subject!.map((v) => v.toJson()).toList();
    }
    data['count'] = count;
    return data;
  }
}

class SubjectList {
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

  SubjectList(
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

  SubjectList.fromJson(Map<String, dynamic> json) {
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
