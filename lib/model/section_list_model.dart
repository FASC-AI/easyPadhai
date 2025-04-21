class   SectionListModel {
  int? code;
  bool? status;
  String? message;
  Data? data;

  SectionListModel({this.code, this.status, this.message, this.data});

  SectionListModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? Data.fromJson(json['data']) : null;
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

class Data {
  List<SectionData>? section;
  int? count;

  Data({this.section, this.count});

  Data.fromJson(Map<String, dynamic> json) {
    if (json['section'] != null) {
      section = <SectionData>[];
      json['section'].forEach((v) {
        section!.add(SectionData.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (section != null) {
      data['section'] = section!.map((v) => v.toJson()).toList();
    }
    data['count'] = count;
    return data;
  }
}

class SectionData {
  String? sId;
  String? codee;
  String? description;
  String? sectionsName;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;

  SectionData(
      {this.sId,
      this.codee,
      this.description,
      this.sectionsName,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV});

  SectionData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    codee = json['codee'];
    description = json['description'];
    sectionsName = json['sectionsName'];
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
    data['sectionsName'] = sectionsName;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['code'] = code;
    data['__v'] = iV;
    return data;
  }
}
