class BinfoModel {
  int? code;
  bool? status;
  String? message;
  InfoData? data;

  BinfoModel({this.code, this.status, this.message, this.data});

  BinfoModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new InfoData.fromJson(json['data']) : null;
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

class InfoData {
  String? sId;
  String? class1;
  String? section;
  String? institute;

  InfoData({this.sId, this.class1, this.section, this.institute});

  InfoData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    class1 = json['class'];
    section = json['section'];
    institute = json['institute'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['class'] = this.class1;
    data['section'] = this.section;
    data['institute'] = this.institute;
    return data;
  }
}
