class ClassListModel {
  int? code;
  bool? status;
  String? message;
  ClassListData? data;

  ClassListModel({this.code, this.status, this.message, this.data});

  ClassListModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? ClassListData.fromJson(json['data']) : null;
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

class ClassListData {
  List<ClassesData>? classes;
  int? count;

  ClassListData({this.classes, this.count});

  ClassListData.fromJson(Map<String, dynamic> json) {
    if (json['Classes'] != null) {
      classes = <ClassesData>[];
      json['Classes'].forEach((v) {
        classes!.add(ClassesData.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (classes != null) {
      data['Classes'] = classes!.map((v) => v.toJson()).toList();
    }
    data['count'] = count;
    return data;
  }
}

class ClassesData {
  String? sId;
  String? codee;
  String? description;
  String? nameEn;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  ClassesData(
      {this.sId,
      this.codee,
      this.description,
      this.nameEn,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV});

  ClassesData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    codee = json['codee'];
    description = json['description'];
    nameEn = json['nameEn'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['_id'] = sId;
    data['codee'] = codee;
    data['description'] = description;
    data['nameEn'] = nameEn;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['code'] = code;
    data['__v'] = iV;
    return data;
  }
}
